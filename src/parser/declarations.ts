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

import {LastOf, SequenceOf, Either, Optional, Rule, ZeroOrMore, List} from 'pegp'
import {T, K} from './base'
import * as lit from './type_literals'

import * as ast from './ast'

export const 
  VAR = SequenceOf(
    Either(K.const, K.let, K.var), 
    T.id, 
    LastOf(T.colon, lit.TYPE)
  ).tf(([kind, id, type]) => 
    new ast.Variable().set({
      kind: kind.text,
      name: id.text,
      type
    })
  ),

  // There are no default values in .d.ts files.
  FUNCTION = SequenceOf(
    LastOf(K.function, T.id),
    Optional(lit.TYPE_ARGUMENTS),
    lit.ARGUMENT_LIST, 
    LastOf(T.colon, lit.TYPE)
  ).tf(([id, type_arguments, args, return_type]) => 
    new ast.Function().set({
      name: id.text, 
      type_arguments: type_arguments || [], 
      arguments: args || [], 
      return_type
    })
  ),

  METHOD = SequenceOf(
    Optional(K.new),
    Optional(T.id), // The name is optional, as it could be a constructor
    Optional(lit.TYPE_ARGUMENTS),
    lit.ARGUMENT_LIST,
    LastOf(T.colon, lit.TYPE)
  ).tf(() => new ast.Method()),

  PROPERTY = SequenceOf(
    T.id,
    LastOf(T.colon, lit.TYPE)
  ).tf(() => new ast.Property()),

  MEMBER = SequenceOf(
    Optional(K.static),
    Optional(Either(K.public, K.private, K.protected)),
    Either(METHOD, PROPERTY) as Rule<ast.Member>
  ).tf(([stat, access, member]) => member.set({is_static: !!stat, visibility: access ? access.text : ''})),


  INTERFACE_OR_CLASS = SequenceOf(
    Either(K.class, K.interface),
    T.id,
    Optional(lit.TYPE_PARAMETERS),
    Optional(LastOf(K.extends, lit.TYPE)),
    Optional(LastOf(K.implements, List(lit.TYPE, T.comma))),
    LastOf(T.lbracket, ZeroOrMore(MEMBER)),
    T.rbracket
  ).tf(([kind, id, param, ext, impl, members]) => 
    ((kind.text === 'interface' ? new ast.Interface() : new ast.Class()) as ast.Implementer)
      .set({
        name: id.text,
        type_parameters: param || [],
        extends: ext,
        implements: impl || [],
        members
      })
  ),

  TYPE = SequenceOf(
    LastOf(K.type, T.id),
    Optional(lit.TYPE_PARAMETERS),
    LastOf(T.equal, lit.TYPE)
  ).tf(([id, gen, type]) => new ast.TypeDeclaration().set({name: id.text, type, type_parameters: gen || []})),


  NAMESPACE = SequenceOf(
    LastOf(K.namespace, T.id),
    LastOf(T.lbracket, ZeroOrMore(() => DECLARATION)),
    T.rbracket
  ).tf(([id, decls]) => new ast.Namespace().set({name: id.text, declarations: decls})),

  DECLARATION: Rule<ast.Declaration> = Either(
    VAR,
    FUNCTION,
    TYPE,
    INTERFACE_OR_CLASS,
    NAMESPACE,
  )
