/**
 * this module defines the grammar for all named declarations that can
 * potentially be exported, such as
 * 
 *   - type
 *   - interface
 *   - namespace
 *   - class
 *   - module (should it be here ???)
 */

import {_, SequenceOf, Either, Optional, Rule} from 'pegp'
import {T, K} from './base'
import {type_literal, generic_arguments, argument_list} from './type_literals'

import * as ast from './ast'

export const 
  var_decl = SequenceOf(
    Either(K.const, K.let, K.var), 
    T.id, 
    _(T.colon, type_literal)
  ).tf(([kind, id, type]) => 
    new ast.Variable().set({
      kind: kind.text,
      name: id.text,
      type
    })
  ),

  // There are no default values in .d.ts files.
  function_decl = SequenceOf(
    _(K.function, T.id),
    Optional(generic_arguments),
    _(T.lparen, Optional(argument_list)), 
    _(T.rparen, T.colon, type_literal)
  ).tf(([id, type_arguments, args, return_type]) => 
    new ast.Function().set({
      name: id.text, 
      type_arguments: type_arguments || [], 
      arguments: args || [], 
      return_type
    })
  )
