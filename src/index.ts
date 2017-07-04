
import {
  Language,
} from 'pegp'

import {tl} from './parser/base'
import {top_level_decl} from './parser/module'


////////////////////////////////////////////
// Language rules.

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
const TSD = Language(top_level_decl, tl)

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync('/dev/stdin', 'utf-8')
var result = TSD.parse(res)
console.log(result)
