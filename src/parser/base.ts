
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
  equal: tl.add('='),
  interrogation: tl.add('?'),
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

function kw(name: string) {
  return T.id.as(name)
}

/**
 * Keywords taken from the t_id rule for shorter declarations.
 */
export const K = {
  global: kw('global'),
  export: kw('export'),
  import: kw('import'),
  from: kw('from'),
  as: kw('as'),
  declare: kw('declare'),

  module: kw('module'),

  abstract: kw('abstract'),
  public: kw('public'),
  private: kw('private'),
  protected: kw('protected'),
  static: kw('static'),
  new: kw('new'),
  extends: kw('extends'),
  implements: kw('implements'),

  type: kw('type'),
  function: kw('function'),
  interface: kw('interface'),
  class: kw('class'),
  namespace: kw('namespace'),

  const: kw('const'),
  var: kw('var'),
  let: kw('let'),
  in: kw('in'),
  of: kw('of'),
  keyof: kw('keyof')
}


export const   
  /**
   * Get a multi-line comment and return its text directly.
   */
  MULTI_COMMENT = Optional(T.multi_comment)
    .tf(lex => lex != null ? lex.text : '')
