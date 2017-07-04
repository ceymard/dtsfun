#!/usr/bin/env node
import {TSD} from '../src'
import {inspect} from 'util'

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync(process.argv[2] || '/dev/stdin', 'utf-8')
var result = TSD.parse(res)
result.forEach(res => {
  console.log(inspect(res, {depth: null, colors: true}))
})

