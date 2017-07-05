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
import {T, K, HasDoc} from './base'
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
    lit.TYPE_PARAMETERS,
    lit.ARGUMENT_LIST, 
    Optional(LastOf(T.colon, lit.TYPE))
  ).tf(([id, type_parameters, args, return_type]) => 
    new ast.Function().set({
      name: id.text, 
      type_parameters: type_parameters, 
      arguments: args || [], 
      return_type: return_type || lit.fake_any
    })
  ),

  INTERFACE_OR_CLASS = SequenceOf(
    Optional(K.abstract),
    Either(K.class, K.interface),
    T.id,
    lit.TYPE_PARAMETERS,
    Optional(LastOf(K.extends, lit.TYPE)),
    Optional(LastOf(K.implements, List(lit.TYPE, T.comma))),
    lit.MEMBERS
  ).tf(([abs, kind, id, param, ext, impl, members]) => 
    ((kind.text === 'interface' ? new ast.Interface() : new ast.Class()) as ast.Implementer)
      .set({
        name: id.text,
        is_abstract: !!abs,
        type_parameters: param,
        extends: ext,
        implements: impl || [],
        members
      })
  ),

  TYPE = SequenceOf(
    LastOf(K.type, T.id),
    lit.TYPE_PARAMETERS,
    LastOf(T.equal, lit.TYPE)
  ).tf(([id, gen, type]) => new ast.TypeDeclaration().set({name: id.text, type, type_parameters: gen})),


  NAMESPACE = SequenceOf(
    LastOf(K.namespace, T.id),
    LastOf(T.lbrace, ZeroOrMore(() => DECLARATION)),
    T.rbrace
  ).tf(([id, decls]) => new ast.Namespace().set({name: id.text, declarations: decls})),

  DECLARATION: Rule<ast.Declaration> = HasDoc(
    Either(
      NAMESPACE,
      VAR,
      FUNCTION,
      TYPE,
      INTERFACE_OR_CLASS,
    ) as Rule<ast.Declaration>,
  )
