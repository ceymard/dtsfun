
import {SequenceOf, List, Optional, Either, ZeroOrMore, Rule} from 'pegp'
import {T, K} from './base'

import * as ast from './ast'

export const 
  argument = SequenceOf(
    Optional(T.ellipsis), 
    T.id, 
    T.colon.then(() => type_literal)
  )
                                  .tf(([ellipsis, id, type]) => 
                                    new ast.Argument()
                                      .name(id.text)
                                      .type(type)
                                      .ellipsis(ellipsis != null)
                                  ),
    
  argument_list = List(argument, T.comma),
 
  generic_arguments = SequenceOf(
    T.lt.then(List(() => type_literal, T.comma)), 
    T.gt
  )
                                  .tf(([types]) => types),

  function_type_literal = SequenceOf(
    Optional(generic_arguments), 
    T.lparen.then(Optional(argument_list)), 
    T.rparen.then(T.fat_arrow).then(() => type_literal)
  )
                                  .tf(([gen, args, type]) => new ast.FunctionLiteral()
                                    .type_arguments(gen)
                                    .arguments(args)
                                    .return_type(type)
                                  ),

  named_type = SequenceOf(
    T.id,
    Optional(generic_arguments)
  )
                                  .tf(([id, args]) =>
                                    new ast.NamedType()
                                      .name(id.text)
                                      .type_arguments(args)
                                  ),

  type_literal: Rule<ast.TypeLiteral> = List(
    Either(
      SequenceOf(
        Either(
          named_type,
          function_type_literal
        ),
        ZeroOrMore(SequenceOf(T.lbracket, T.rbracket))
      )
                                  .tf(([type, array_number]) => type.array_number(array_number.length)),

      SequenceOf(T.lparen, () => type_literal, T.rparen)
                                  .tf(([lp, type, rp]) => type)
    ),
    T.pipe
  )
                                  .tf((lst) => lst.length > 1 ? new ast.UnionType().types(lst) : lst[0])
