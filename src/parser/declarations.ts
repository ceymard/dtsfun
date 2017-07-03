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

import {SequenceOf, Either, Optional} from 'pegp'
import {T, K} from './base'
import {type_literal, generic_arguments, argument_list} from './type_literals'

import * as ast from './ast'

export const 
  var_decl = SequenceOf(
    Either(K.const, K.let, K.var), 
    T.id, 
    T.colon, 
    type_literal
  ).tf(([kind, id, colon, type]) => 
    new ast.Variable()
      .kind(kind.text)
      .name(id.text)
      .type(type)
  ),

  // There are no default values in .d.ts files.
  function_decl = SequenceOf(
    K.function.then(T.id),
    Optional(generic_arguments),
    T.lparen.then(Optional(argument_list)), 
    T.rparen.then(T.colon).then(type_literal)
  ).tf(([id, type_args, args, type]) => 
    new ast.Function()
      .name(id.text)
      .type_arguments(type_args)
      .arguments(args)
      .return_type(type)
  )
