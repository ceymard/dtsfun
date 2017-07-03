
import {
  SequenceOf, Language, Either, List, Optional, Forward, Rule, TokenList, LanguageRule,
  ZeroOrMore
} from 'pegp'

import {Type} from './ast'

//////////////////////////////////////////////
// Token definition.

const t = new TokenList()
const sk = new TokenList()
sk.add(/[\n\s\t\r ]+/)
sk.add(/\/\/[^\n]*\n/) // single comment.

const
  t_id = t.add(/[a-zA-Z_$][a-zA-Z0-9_$]+/),
  t_lparen = t.add('('),
  t_rparen = t.add(')'),
  t_lbracket = t.add('{'),
  t_rbracket = t.add('}'),
  t_colon = t.add(':'),
  t_semicolon = t.add(';'),
  t_comma = t.add(','),
  t_lt = t.add('<'),
  t_gt = t.add('>')


////////////////////////////////////////////
// Language rules.
const
  // since the semi colon is pretty much optional all the time,
  // make a rule that uses it as is.
  semi = Optional(t_semicolon),

  type_arguments: Rule<any> = SequenceOf(t_lt, List(Forward(() => type), t_comma), t_gt),

  type = SequenceOf(
    t_id,
    Optional(type_arguments)
  ).tf(([id, gen]) =>
    new Type()
    .name(id.text)
  ),

  var_decl = SequenceOf(t_id.as('const', 'var', 'let'), t_id, t_colon, type, semi),

  // There are no default values in .d.ts files.
  argument = SequenceOf(t_id, t_colon, type),

  function_decl = SequenceOf(t_id, t_lparen, Optional(List(argument, t_comma)), t_rparen, t_colon, type),

  export_rule = SequenceOf(
    t_id.as('export'), Optional(t_id.as('declare')), Either(
      var_decl,
      function_decl,
      type
    )
  ),

  import_rule = SequenceOf(
    t_id.as('import'),
    semi
  ),

  // Inline module declaration in a file of modules
  module_decl = SequenceOf(
    t_id.as('declare'),
    t_id.as('module'),
    t_id, // module name
    t_lbracket,
    ZeroOrMore(Either(
      import_rule,
      export_rule
    )),
    t_rbracket
  )

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
export const TSD: LanguageRule<any> = Language(module_decl, t)
