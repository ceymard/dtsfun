/**
 * Type literals are types that use already declared types to build new ones.
 */

import {LastOf, FirstOf, SequenceOf, List, Optional, Either, ZeroOrMore, Rule} from 'pegp'
import {T, K, HasDoc} from './base'

import * as ast from './ast'

export const 
  ARGUMENT = SequenceOf(
    Optional(T.ellipsis), 
    T.id,
    Optional(T.interrogation),
    Optional(LastOf(T.colon, () => TYPE))
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

  TYPE_PARAMETERS = Optional(FirstOf(
    LastOf(T.lt, List(TYPE_PARAMETER, T.comma)),
    T.gt
  )).tf(params => params ? params : [] as ast.TypeParameter[]),

  ///////////////////////////////////////////////////
  TYPE_ARGUMENTS = SequenceOf(
    LastOf(T.lt, List(() => TYPE, T.comma)), 
    T.gt
  )
                                  .tf(([types]) => types),


  METHOD = SequenceOf(
    Optional(K.new),
    Optional(T.id), // The name is optional, as it could be a constructor
    Optional(T.interrogation),
    TYPE_PARAMETERS,
    ARGUMENT_LIST,
    Optional(LastOf(T.colon, () => TYPE))
  ).tf(([is_new, id, inte, type_parameters, args, return_type]) => 
    new ast.Method().set({name: id ? id.text : '', is_new: !!is_new, type_parameters, return_type, is_optional: !!inte})
  ),

  DYNAMIC_PROPERTY = SequenceOf(
    LastOf(T.lbracket, T.id),
    Either(
      LastOf(T.colon, () => TYPE),
      LastOf(K.in, () => TYPE)
    ),
    LastOf(T.rbracket, Optional(T.interrogation)), 
    Optional(LastOf(T.colon, () => TYPE))
  ).tf(([id, key_type, opt, type]) => new ast.IndexProperty().set({type, name: id.text, key_type, is_optional: !!opt})),

  PROPERTY = SequenceOf(
    Either(T.id, T.string, T.number),
    Optional(T.interrogation),
    Optional(LastOf(T.colon, () => TYPE))
  ).tf(([id, opt, type]) => new ast.Property().set({name: id.text, is_optional: !!opt, type})),

  MEMBER_FINAL = Either(METHOD, PROPERTY, DYNAMIC_PROPERTY) as Rule<ast.Member>,

  READONLY = Either(MEMBER_FINAL, LastOf(K.readonly, MEMBER_FINAL).tf(mem => mem.set({is_readonly: true}))),

  ABSTRACT = Either(READONLY, LastOf(K.abstract, READONLY).tf(mem => mem.set({is_abstract: true}))),

  STATIC = Either(ABSTRACT, LastOf(K.static, ABSTRACT).tf(mem => mem.set({is_abstract: true}))),

  MEMBER = Either(
    STATIC, 
    SequenceOf(
      Either(K.public, K.private, K.protected), STATIC
    ).tf(([access, mem]) => mem.set({visibility: access.text}))
  ),

  MEMBERS = FirstOf(
    LastOf(T.lbrace, ZeroOrMore(MEMBER)),
    T.rbrace
  ),

  ///////////////////////////////////////////////////
  IS_OPERATOR = SequenceOf(
    FirstOf(T.id, K.is),
    () => TYPE
  ).tf(([id, type]) => new ast.IsType().set({name: id.text, type})),

  ///////////////////////////////////////////////////
  FUNCTION = SequenceOf(
    Optional(K.new),
    TYPE_PARAMETERS, 
    ARGUMENT_LIST, 
    LastOf(T.fat_arrow, () => TYPE)
  )
                                  .tf(([is_new, params, args, return_type]) => new ast.FunctionLiteral().set({
                                    type_parameters: params, arguments: args || [], return_type, is_new: !!is_new
                                  })),

  DOTTED_NAME = List(T.id.tf(id => id.text), T.dot).tf(names => new ast.NameReference().set({reference: names})),

  ///////////////////////////////////////////////////
  NAMED = SequenceOf(
    DOTTED_NAME,
    Optional(TYPE_ARGUMENTS)
  )                               .tf(([name, type_arguments]) =>
                                    new ast.NamedType().set({name_reference: name, type_arguments})
                                  ),

  TUPLE = SequenceOf(
    LastOf(T.lbracket, List(() => TYPE, T.comma)),
    T.rbracket
  )                               .tf(([lst]) => new ast.TupleLiteral().set({types: lst})),

  OBJECT_LITERAL = MEMBERS.tf((members) => new ast.ObjectLiteral().set({members})),

  ///////////////////////////////////////////////////
  TYPE_BASE = Either(
    FirstOf(LastOf(T.lparen, () => TYPE), T.rparen),
    LastOf(K.keyof, () => TYPE).tf(type => new ast.KeyOfType().set({type})),
    LastOf(K.typeof, () => TYPE).tf(type => new ast.TypeOf().set({type})),
    FUNCTION,
    TUPLE,
    IS_OPERATOR,
    NAMED,
    OBJECT_LITERAL,
    T.string.tf(str => new ast.StringType().set({string: str.text})),
    T.number.tf(num => new ast.NumberType().set({number: parseFloat(num.text)}))
  ) as Rule<ast.Type>,

  ARRAY_TYPE: Rule<ast.ArrayOfType> = SequenceOf(
    TYPE_BASE, 
    ZeroOrMore<ast.TypeModifier>(Either(
      SequenceOf(T.lbracket, T.rbracket)
                                  .tf(arg => new ast.ArrayOfType()), 
      FirstOf(LastOf(T.lbracket, () => TYPE), T.rbracket)
                                  .tf(index_type => new ast.IndexType().set({index_type}))
    ))
  )
    .tf(([type, modifiers]) => modifiers.reduce((acc, mod) => mod.set({type: acc}), type)),

  INTERSECTION_TYPE = List(ARRAY_TYPE, T.ampersand).tf((lst) => lst.length > 1 ? new ast.IntersectionType().set({types: (lst)}) : lst[0]),

  UNION_TYPE = List(INTERSECTION_TYPE, T.pipe).tf((lst) => lst.length > 1 ? new ast.UnionType().set({types: (lst)}) : lst[0]),

  TYPE: Rule<ast.Type> = UNION_TYPE
                                  
