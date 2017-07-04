/**
 * Type literals are types that use already declared types to build new ones.
 */

import {LastOf, FirstOf, SequenceOf, List, Optional, Either, ZeroOrMore, Rule} from 'pegp'
import {T, K, MULTI_COMMENT} from './base'

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
    LastOf(T.colon, () => TYPE)
  ).tf(([id, key_type, opt, type]) => new ast.DynamicProperty().set({type, name: id.text, key_type, is_optional: !!opt})),

  PROPERTY = SequenceOf(
    MULTI_COMMENT,
    Either(T.id, T.string),
    Optional(T.interrogation),
    LastOf(T.colon, () => TYPE)
  ).tf(([doc, id, opt, type]) => new ast.Property().set({name: id.text, is_optional: !!opt, type, doc})),

  MEMBER = SequenceOf(
    Optional(K.static),
    Optional(Either(K.public, K.private, K.protected)),
    Optional(K.abstract),
    Either(METHOD, PROPERTY, DYNAMIC_PROPERTY) as Rule<ast.Member>
  ).tf(([stat, access, abs, member]) => member.set({is_static: !!stat, visibility: access ? access.text : '', is_abstract: !!abs})),

  MEMBERS = FirstOf(
    LastOf(T.lbrace, ZeroOrMore(MEMBER)),
    T.rbrace
  ),

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
    FUNCTION,
    TUPLE,
    NAMED,
    OBJECT_LITERAL,
    T.string.tf(str => new ast.StringType().set({string: str.text})),
    T.number.tf(num => new ast.NumberType().set({number: parseFloat(num.text)}))
  ) as Rule<ast.Type>,

  ARRAY_TYPE = FirstOf(TYPE_BASE, SequenceOf(T.lbracket, T.rbracket))
    .tf(type => new ast.ArrayOfType().set({type})),

  INDEX_TYPE = SequenceOf(TYPE_BASE, LastOf(T.lbracket, () => TYPE), T.rbracket)
    .tf(([type, index_type]) => new ast.IndexType().set({type, index_type})),

  TYPE: Rule<ast.Type> = List(
    Either(
      ARRAY_TYPE,
      INDEX_TYPE,
      TYPE_BASE,
    ),
    T.pipe
  )
                                  .tf((lst) => lst.length > 1 ? new ast.UnionType().set({types: (lst)}) : lst[0])
