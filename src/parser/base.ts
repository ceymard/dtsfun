
import {TokenList, Optional, TokenRule, Lexeme, Rule, SequenceOf} from 'pegp'

export const tl = new TokenList()
import * as ast from './ast'

export const T = {
  // single comment.
  comment: tl.skip(/\/\/[^\n]*\n/),
  multi_comment: tl.skip(/\/\*((?!\*\/).|\n|\r)*\*\//m),
  space: tl.skip(/[\n\s\t\r ]+/) as TokenRule,
  semi: tl.skip(';'),
  string: tl.add(/'((\\')|[^'\n])*'|"((\\")|[^'\n])*"/),
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
  star: tl.add('*'),
  dot: tl.add('.'),
  ampersand: tl.add('&')
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
  is: kw('is'),
  declare: kw('declare'),

  module: kw('module'),

  readonly: kw('readonly'),
  abstract: kw('abstract'),
  public: kw('public'),
  private: kw('private'),
  protected: kw('protected'),
  static: kw('static'),
  new: kw('new'),
  extends: kw('extends'),
  implements: kw('implements'),

  type: kw('type'),
  keyof: kw('keyof'),
  typeof: kw('typeof'),
  function: kw('function'),
  interface: kw('interface'),
  enum: kw('enum'),
  class: kw('class'),
  namespace: kw('namespace'),

  const: kw('const'),
  var: kw('var'),
  let: kw('let'),
  in: kw('in'),
  of: kw('of'),
}

   
/**
 * Get a multi-line comment and return its text directly.
 */
const  MULTI_COMMENT = Optional(T.multi_comment)
    .tf(lex => lex != null ? lex.text : '')

export function HasDoc<R extends Rule<ast.Declaration>>(r: R): R {
  return SequenceOf(MULTI_COMMENT, r).tf(([doc, res]) => {
    res.doc = doc
    return res
  }) as R
}