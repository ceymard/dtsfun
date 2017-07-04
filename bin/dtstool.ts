#!/usr/bin/env node
import {TSD} from '../src'

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync(process.argv[2] || '/dev/stdin', 'utf-8')
var result = TSD.parse(res)
console.log(result)
