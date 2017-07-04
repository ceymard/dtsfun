
import {
  Language,
} from 'pegp'

export * from './parser/ast'

import {tl} from './parser/base'
import {TOP_LEVEL} from './parser/module'


////////////////////////////////////////////
// Language rules.

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
const TSD = Language(TOP_LEVEL, tl)

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync('/dev/stdin', 'utf-8')
var result = TSD.parse(res)
console.log(result)
