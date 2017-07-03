
import {
  SequenceOf, Language, Either, List, Optional, Rule, TokenList,
  ZeroOrMore
} from 'pegp'

import * as ast from './ast'

//////////////////////////////////////////////
// Token definition.

const tl = new TokenList()

const T = {
  space: tl.skip(/[\n\s\t\r ]+/),
  // single comment.
  comment: tl.skip(/\/\/[^\n]*\n/),
  // we skip semi colons since they're not significant
  // they would only be useful if we had ambiguous return statements or function calls,
  // but .d.ts files are actually rather clean so we really don't want to have
  // to say Optional(semi) everywhere.
  semi: tl.skip(';'),
  // We add the multi comment as skippable as we will only occasionnaly look
  // for it.
  multi_comment: tl.skip(/\/\*((?!\*\/).|\n)*\*\//),
  string: tl.add(/'((\\')|[^'])*'|"((\\")|[^'])*"/),
  number: tl.add(/[0-9]+(\.[0-9]+)?/),
  id: tl.add(/[a-zA-Z_$][a-zA-Z0-9_$]*/),
  fat_arrow: tl.add('=>'),
  quote: tl.add("'"),
  dquote: tl.add('"'),
  backtick: tl.add('`'),
  lparen: tl.add('('),
  rparen: tl.add(')'),
  lbrace: tl.add('{'),
  rbrace: tl.add('}'),
  lbracket: tl.add('['),
  rbracket: tl.add(']'),
  colon: tl.add(':'),
  comma: tl.add(','),
  pipe: tl.add('|'),
  ellipsis: tl.add('...'),
  lt: tl.add('<'),
  gt: tl.add('>')
}

/**
 * Keywords taken from the t_id rule for shorter declarations.
 */
const K = {
  global: T.id.as('global'),
  export: T.id.as('export'),
  import: T.id.as('import'),
  from: T.id.as('from'),
  as: T.id.as('as'),
  declare: T.id.as('declare'),

  module: T.id.as('module'),

  function: T.id.as('function'),

  const: T.id.as('const'),
  var: T.id.as('var'),
  let: T.id.as('let'),
}

////////////////////////////////////////////
// Language rules.
const
  /**
   * Get a multi-line comment and return its text directly.
   */
  multi_line_comment = Optional(T.multi_comment)
    .tf(lex => lex != null ? lex.text : ''),

  generic_arguments = SequenceOf(T.lt, List(() => type_litteral, T.comma), T.gt)
    .tf(([lt, types, gt]) => types),

  function_type_litteral = SequenceOf(
    Optional(generic_arguments), 
    T.lparen, 
    Optional(() => argument_list), 
    T.rparen,
    T.fat_arrow,
    () => type_litteral
  ).tf(([gen, lp, args, rp, fa, type]) => new ast.FunctionLiteral()
    .type_arguments(gen)
    .arguments(args)
    .return_type(type)
  ),

  named_type = SequenceOf(
    T.id,
    Optional(generic_arguments)
  ).tf(([id, args]) =>
    new ast.NamedType()
      .name(id.text)
      .type_arguments(args)
  ),

  type_litteral: Rule<ast.TypeLiteral> = List(
    Either(
      SequenceOf(
        Either(
          named_type,
          function_type_litteral
        ),
        ZeroOrMore(SequenceOf(T.lbracket, T.rbracket))
      ).tf(([type, array_number]) => type.array_number(array_number.length)),
      SequenceOf(T.lparen, () => type_litteral, T.rparen).tf(([lp, type, rp]) => type)
    ),
    T.pipe
  ).tf((lst) => lst.length > 1 ? new ast.UnionType().types(lst) : lst[0]),

  var_decl = SequenceOf(
    Either(K.const, K.let, K.var), 
    T.id, 
    T.colon, 
    type_litteral
  ).tf(([kind, id, colon, type]) => 
    new ast.Variable()
      .kind(kind.text)
      .name(id.text)
      .type(type)
  ),

  // There are no default values in .d.ts files.

  argument = SequenceOf(Optional(T.ellipsis), T.id, T.colon, type_litteral)
    .tf(([ellipsis, id, colon, type]) => 
      new ast.Argument()
        .name(id.text)
        .type(type)
        .ellipsis(ellipsis != null)
    ),
    
  argument_list = List(argument, T.comma),

  function_decl = SequenceOf(
    K.function,
    T.id, 
    Optional(generic_arguments),
    T.lparen, 
    Optional(argument_list), 
    T.rparen, 
    T.colon, 
    type_litteral
  ).tf(([fun, id, type_args, lp, args, rp, colon, type]) => 
    new ast.Function()
      .name(id.text)
      .type_arguments(type_args)
      .arguments(args)
      .return_type(type)
  ),

  export_rule = SequenceOf(
    multi_line_comment,
    K.export, 
    Optional(K.declare), 
    Either(
      var_decl,
      function_decl
    )
  ).tf(([comment, kex, kdecl, decl]) => decl.doc(comment).is_export(true)),

  import_var = SequenceOf(T.id, Optional(SequenceOf(K.as, T.id).tf(([ask, id]) => id)))
    .tf(([id, as_id]) => 
      new ast.Import()
        .name(id.text)
        .as(as_id ? as_id.text : null)
    ),

  from_clause = SequenceOf(K.from, T.string).tf(([k, str]) => str.text),

  import_rule = SequenceOf(
    K.import,
    T.lbrace,
    List(import_var, T.comma),
    T.rbrace,
    from_clause
  ).tf(([ik, lb, imports, rb, mod_name]) => 
    new ast.ImportList()
      .imports(imports)
      .module_name(mod_name)
    ),

  global = SequenceOf(K.global),

  // Inline module declaration in a file of modules
  module_decl = SequenceOf(
    multi_line_comment,
    K.declare,
    K.module,
    T.id, // module name
    T.lbrace,
    ZeroOrMore(Either(
      import_rule,
      export_rule,
      global
    )),
    T.rbrace
  ),

  top_level_decl = ZeroOrMore(Either(
    import_rule,
    export_rule,
    SequenceOf(K.declare, K.global, T.lbrace, ZeroOrMore(function_decl), T.rbrace)
      .tf(([k1, k2, k3, decls, k4]) => new ast.GlobalAugmentations().augmentations(decls))
  ))

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
const TSD = Language(top_level_decl, tl)

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync('/dev/stdin', 'utf-8')
TSD.parse(res).forEach(r => console.log(r.render()))
