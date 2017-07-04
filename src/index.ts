
import {
  Language, LanguageRule, Lexeme
} from 'pegp'

import * as ast from './parser/ast'

export * from './parser/ast'
export * from './visitor'

import {tl} from './parser/base'
import {TOP_LEVEL} from './parser/module'


////////////////////////////////////////////
// Language rules.

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
export const TSD = Language(TOP_LEVEL, tl)
