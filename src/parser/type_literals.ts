
import {_, SequenceOf, List, Optional, Either, ZeroOrMore, Rule} from 'pegp'
import {T} from './base'

import * as ast from './ast'

export const 
  argument = SequenceOf(
    Optional(T.ellipsis), 
    T.id, 
    _(T.colon, () => type_literal)
  )
                                  .tf(([ellipsis, id, type]) => 
                                    new ast.Argument().set({name: id.text, type, ellipsis: ellipsis != null})
                                  ),

  ///////////////////////////////////////////////////
  argument_list = List(argument, T.comma),

  ///////////////////////////////////////////////////
  generic_arguments = SequenceOf(
    _(T.lt, List(() => type_literal, T.comma)), 
    T.gt
  )
                                  .tf(([types]) => types),


  ///////////////////////////////////////////////////
  function_type_literal = SequenceOf(
    Optional(generic_arguments), 
    _(T.lparen, Optional(argument_list)), 
    _(T.rparen, T.fat_arrow, () => type_literal)
  )
                                  .tf(([type_arguments, args, return_type]) => new ast.FunctionLiteral().set({
                                    type_arguments, arguments: args, return_type
                                  })),

  ///////////////////////////////////////////////////
  named_type = SequenceOf(
    T.id,
    Optional(generic_arguments)
  )                               .tf(([id, type_arguments]) =>
                                    new ast.NamedType().set({name: id.text, type_arguments})
                                  ),

  ///////////////////////////////////////////////////
  type_literal: Rule<ast.TypeLiteral> = List(
    Either(
      SequenceOf(
        Either(
          named_type,
          function_type_literal
        ),
        ZeroOrMore(SequenceOf(T.lbracket, T.rbracket))
      )                           .tf(([type, array_number]) => (type as ast.TypeLiteral).set({array_number: array_number.length})),

      SequenceOf(T.lparen, () => type_literal, T.rparen)
                                  .tf(([lp, type, rp]) => type)
    ),
    T.pipe
  )
                                  .tf((lst) => lst.length > 1 ? new ast.UnionType().set({types: (lst)}) : lst[0])
