
import {
  Token as T, _, Language, Either, List, Optional
} from 'pegp'

import {Variable, Type} from './ast'

//////////////////////////////////////////////
// Token definition.
const 
  ID = T(/[a-zA-Z_$][a-zA-Z0-9_$]+/),
  LPAREN = T('('),
  RPAREN = T(')'),
  COLON = T(':'),
  SEMICOLON = T(';'),
  COMMA = T(',')


////////////////////////////////////////////
// Language rules.
const
  TYPE_DEF = _(
    ID
  ).tf(t => new Type()),

  VAR_DECL = _(ID.as('const', 'var', 'let'), ID, COLON, TYPE_DEF, SEMICOLON),

  // Missing default value.
  ARGUMENT = _(ID, COLON, TYPE_DEF),

  FUN_DECL = _(ID, LPAREN, Optional(List(ARGUMENT, COMMA)), RPAREN, COLON, TYPE_DEF),

  EXPORT = _(
    ID.as('export'), Optional(ID.as('declare')), Either(
      VAR_DECL,
      FUN_DECL,
      TYPE_DEF
    )
  )

const TSD = Language(Either(
  EXPORT,
  TYPE_DEF // No.
)).tokenize(
  ID,
  COLON,
  SEMICOLON
)
