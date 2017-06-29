
import {
  Token as T, _, Language, Either, List, Optional, Forward, Rule, TokenList
} from 'pegp'

import {Type} from './ast'

//////////////////////////////////////////////
// Token definition.

const t = new TokenList()
const sk = new TokenList()
sk.add(/[\n\s\t\r ]+/)

const
  ID = t.add(/[a-zA-Z_$][a-zA-Z0-9_$]+/),
  LPAREN = t.add('('),
  RPAREN = t.add(')'),
  COLON = t.add(':'),
  SEMICOLON = t.add(';'),
  COMMA = t.add(','),
  LT = t.add('<'),
  GT = t.add('>'),
  SINGLE_COMMENT = sk.add(/\/\/[^\n]*\n/)


////////////////////////////////////////////
// Language rules.
const
  // since the semi colon is pretty much optional all the time,
  // make a rule that uses it as is.
  SEMI = Optional(SEMICOLON),

  GENERICS: Rule<any> = _(LT, List(Forward(() => TYPE_DEF), COMMA), GT),

  TYPE_DEF = _(
    ID,
    Optional(GENERICS)
  ).tf(([id, gen]) =>
    new Type()
    .name(id.text)
    .doc('hello')
  ),

  VAR_DECL = _(ID.as('const', 'var', 'let'), ID, COLON, TYPE_DEF, SEMI),

  // Missing default value.
  ARGUMENT = _(ID, COLON, TYPE_DEF),

  FUN_DECL = _(ID, LPAREN, Optional(List(ARGUMENT, COMMA)), RPAREN, COLON, TYPE_DEF),

  EXPORT = _(
    ID.as('export'), Optional(ID.as('declare')), Either(
      VAR_DECL,
      FUN_DECL,
      TYPE_DEF
    )
  ),

  IMPORT = _(
    ID.as('import'),

    SEMI
  )

export const TSD = Language(Either(
  EXPORT,
  TYPE_DEF // No.
)).tokens(t).skip(sk)
