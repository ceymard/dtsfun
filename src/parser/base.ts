
import {TokenList, Optional, TokenRule, Lexeme, Rule} from 'pegp'

export const tl = new TokenList()

export const T = {
  space: tl.skip(/[\n\s\t\r ]+/) as TokenRule,
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
  gt: tl.add('>'),
  star: tl.add('*')
}

/**
 * Keywords taken from the t_id rule for shorter declarations.
 */
export const K = {
  global: T.id.as('global') as Rule<Lexeme>,
  export: T.id.as('export'),
  import: T.id.as('import'),
  from: T.id.as('from'),
  as: T.id.as('as'),
  declare: T.id.as('declare'),

  module: T.id.as('module'),

  type: T.id.as('type'),
  function: T.id.as('function'),
  interface: T.id.as('interface'),
  class: T.id.as('class'),
  namespace: T.id.as('namespace'),

  const: T.id.as('const'),
  var: T.id.as('var'),
  let: T.id.as('let'),
}


export const   
  /**
   * Get a multi-line comment and return its text directly.
   */
  multi_line_comment = Optional(T.multi_comment)
    .tf(lex => lex != null ? lex.text : '')
