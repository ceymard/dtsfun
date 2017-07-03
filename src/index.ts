
import {
  SequenceOf, Language, Either, List, Optional, Rule, TokenList, LanguageRule,
  ZeroOrMore
} from 'pegp'

import * as ast from './ast'

//////////////////////////////////////////////
// Token definition.

const token_list = new TokenList()

const T = {
  space: token_list.skip(/[\n\s\t\r ]+/),
  // single comment.
  comment: token_list.skip(/\/\/[^\n]*\n/),
  // we skip semi colons since they're not significant
  // they would only be useful if we had ambiguous return statements or function calls,
  // but .d.ts files are actually rather clean so we really don't want to have
  // to say Optional(semi) everywhere.
  semi: token_list.skip(';'),
  // We add the multi comment as skippable as we will only occasionnaly look
  // for it.
  multi_comment: token_list.skip(/\/\*((?!:\*\/).)*\*\//),
  string: token_list.add(/'((\\')|[^'])*'|"((\\")|[^'])*"/),
  number: token_list.add(/[0-9]+(\.[0-9]+)?/),
  id: token_list.add(/[a-zA-Z_$][a-zA-Z0-9_$]+/),
  fat_arrow: token_list.add('=>'),
  quote: token_list.add("'"),
  dquote: token_list.add('"'),
  backtick: token_list.add('`'),
  lparen: token_list.add('('),
  rparen: token_list.add(')'),
  lbracket: token_list.add('{'),
  rbracket: token_list.add('}'),
  colon: token_list.add(':'),
  comma: token_list.add(','),
  lt: token_list.add('<'),
  gt: token_list.add('>')
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

  generic_arguments = SequenceOf(T.lt, List(() => type, T.comma), T.gt)
    .tf(([lt, types, gt]) => types),

  type_function = SequenceOf(
    Optional(generic_arguments), 
    T.lparen, 
    Optional(() => argument_list), 
    T.rparen,
    T.fat_arrow,
    () => type
  ),

  type: Rule<ast.Type> = SequenceOf(
    T.id,
    Optional(generic_arguments)
  ).tf(([id, args]) =>
    new ast.Type()
      .name(id.text)
      .type_arguments(args)
  ),

  var_decl = SequenceOf(
    Either(K.const, K.let, K.var), 
    T.id, 
    T.colon, 
    type
  ).tf(([kind, id, colon, type]) => 
    new ast.Variable()
      .kind(kind.text)
      .name(id.text)
      .type(type)
  ),

  // There are no default values in .d.ts files.

  argument = SequenceOf(T.id, T.colon, type)
    .tf(([id, colon, type]) => 
      new ast.Argument()
        .name(id.text)
        .type(type)
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
    type
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
      function_decl,
      type
    )
  ).tf(([comment, kex, kdecl, decl]) => decl.doc(comment)),

  import_var = SequenceOf(T.id, Optional(SequenceOf(K.as, T.id))),

  import_rule = SequenceOf(
    K.import,
    T.lbracket,
    List(import_var, T.comma),
    T.rbracket,
    K.from,
    T.string
  ),

  global = SequenceOf(K.global),

  // Inline module declaration in a file of modules
  module_decl = SequenceOf(
    multi_line_comment,
    K.declare,
    K.module,
    T.id, // module name
    T.lbracket,
    ZeroOrMore(Either(
      import_rule,
      export_rule,
      global
    )),
    T.rbracket
  ),

  top_level_decl = ZeroOrMore(Either(
    import_rule,
    export_rule,
    module_decl
  ))

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
export const TSD: LanguageRule<any> = Language(top_level_decl, token_list)

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync('/dev/stdin', 'utf-8')
console.log(TSD.parse(res))
