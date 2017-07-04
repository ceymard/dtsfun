/**
 * Type literals are types that use already declared types to build new ones.
 */

import {LastOf, FirstOf, SequenceOf, List, Optional, Either, ZeroOrMore, Rule} from 'pegp'
import {T, K} from './base'

import * as ast from './ast'

export const 
  ARGUMENT = SequenceOf(
    Optional(T.ellipsis), 
    T.id,
    Optional(T.interrogation),
    LastOf(T.colon, () => TYPE)
  )
                                  .tf(([ellipsis, id, optional, type]) => 
                                    new ast.Argument().set({
                                      name: id.text, 
                                      type, 
                                      ellipsis: ellipsis != null, 
                                      optional: optional != null
                                  })),

  ///////////////////////////////////////////////////
  ARGUMENT_LIST = SequenceOf(
    LastOf(T.lparen, Optional(List(ARGUMENT, T.comma))), 
    T.rparen
  )
    .tf(([lst]) => lst || []),

  ///////////////////////////////////////////////////
  TYPE_PARAMETER = SequenceOf(
    T.id,
    Optional(LastOf(K.extends, () => TYPE)),
    Optional(LastOf(T.equal, () => TYPE))
  ).tf(([id, ext, def]) => new ast.TypeParameter().set({name: id.text, extends: ext, default: def})),

  TYPE_PARAMETERS = FirstOf(
    LastOf(T.lt, List(TYPE_PARAMETER, T.comma)),
    T.gt
  ),

  ///////////////////////////////////////////////////
  TYPE_ARGUMENTS = SequenceOf(
    LastOf(T.lt, List(() => TYPE, T.comma)), 
    T.gt
  )
                                  .tf(([types]) => types),


  ///////////////////////////////////////////////////
  FUNCTION = SequenceOf(
    Optional(TYPE_PARAMETERS), 
    ARGUMENT_LIST, 
    LastOf(T.fat_arrow, () => TYPE)
  )
                                  .tf(([params, args, return_type]) => new ast.FunctionLiteral().set({
                                    type_parameters: params || [], arguments: args || [], return_type
                                  })),

  ///////////////////////////////////////////////////
  NAMED = SequenceOf(
    T.id,
    Optional(TYPE_ARGUMENTS)
  )                               .tf(([id, type_arguments]) =>
                                    new ast.NamedType().set({name: id.text, type_arguments})
                                  ),

  TUPLE = SequenceOf(
    LastOf(T.lbracket, List(() => TYPE, T.comma)),
    T.rbracket
  )                               .tf(([lst]) => new ast.TupleLiteral().set({types: lst})),

  ///////////////////////////////////////////////////
  TYPE: Rule<ast.TypeLiteral> = List(
    Either(
      SequenceOf(
        Either(
          FUNCTION,
          TUPLE,
          NAMED,
        ) as Rule<ast.TypeLiteral>,
        ZeroOrMore(SequenceOf(T.lbracket, T.rbracket))
      )                           .tf(([type, array_number]) => type.set({array_number: array_number.length})),

      SequenceOf(T.lparen, () => TYPE, T.rparen)
                                  .tf(([lp, type, rp]) => type)
    ),
    T.pipe
  )
                                  .tf((lst) => lst.length > 1 ? new ast.UnionType().set({types: (lst)}) : lst[0])
