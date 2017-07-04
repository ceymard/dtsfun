
import {FirstOf, LastOf, SequenceOf, Optional, Either, List, ZeroOrMore, Rule, Lexeme, SequenceRule, ZeroOrMoreRule} from 'pegp'
import {K, T, MULTI_COMMENT} from './base'
import * as decl from './declarations'
import * as lit from './type_literals'
import * as ast from './ast'

export const
  SINGLE_IMPORT_EXPORT = SequenceOf(
    T.id, 
    Optional(LastOf(K.as, T.id))
  )
                                .tf(([id, as_id]) => 
                                  new ast.SingleImportExport().set({name: id.text, as: as_id ? as_id.text : ''})
                                ),

  EXPORT_DECLARATION = SequenceOf(
    MULTI_COMMENT,
    LastOf(K.export, Optional(K.declare), decl.DECLARATION) // we have to type it because Partial<> doesn't do well with union types.
  ).tf(([comment, decl]) => decl.set({doc: comment, is_export: true})),


  FROM_CLAUSE = SequenceOf(K.from, T.string).tf(([k, str]) => str.text),


  EXPORT_FROM = SequenceOf(
    LastOf(K.export, Either(
      SequenceOf(
        LastOf(T.lbrace, List(SINGLE_IMPORT_EXPORT, T.comma)),
        T.rbrace,
      ).tf(([lst]) => lst),

      T.star.tf(star => [new ast.SingleImportExport().set({name: '*'})])
    )),
    FROM_CLAUSE
  ).tf(([imports, from_module]) => 
    new ast.ExportList().set({imports, from_module})
  ),


  IMPORT = SequenceOf(
    LastOf(
      K.import,
      Either(
        LastOf(
          T.lbrace, 
          FirstOf(List(SINGLE_IMPORT_EXPORT, T.comma), T.rbrace)
        ),
        LastOf(T.star, K.as, T.id).tf(id => [new ast.SingleImportExport().set({name: '*', as: id.text})])
      )
    ),
    FROM_CLAUSE
  ).tf(([imports, from_module]) => 
    new ast.ImportList().set({imports, from_module})
  ),


  DECLARE_GLOBAL = SequenceOf(
    LastOf(K.declare, K.global, T.lbrace, ZeroOrMore(decl.DECLARATION)),
    T.rbrace
  ).tf(([decls]) => new ast.GlobalAugmentations().set({declarations: decls})),


  DECLARATION = LastOf(
    K.declare,
    decl.DECLARATION
  ),

  EXPORT_AS_NAMESPACE = LastOf(
    K.export, K.as, K.namespace, lit.DOTTED_NAME
  ).tf(name_reference => new ast.ExportAsNamespace().set({name_reference})),

  EXPORT_EQUAL = LastOf(
    K.export,
    T.equal,
    lit.DOTTED_NAME
  ).tf(name_reference => new ast.ExportEquals().set({name_reference})),


  MODULE_CONTENTS = ZeroOrMore(Either(
    IMPORT,
    EXPORT_DECLARATION,
    EXPORT_AS_NAMESPACE,
    EXPORT_EQUAL,
    EXPORT_FROM
  )),


  // Inline module declaration in a file of modules
  DECLARE_MODULE = SequenceOf(
    MULTI_COMMENT,
    LastOf(K.declare, K.module, T.string), // module name
    LastOf(T.lbrace, MODULE_CONTENTS),
    T.rbrace
  ).tf(([doc, modname, contents]) => new ast.Module().set({doc: doc, name: modname.text, contents})),

  TOP_LEVEL = ZeroOrMore(Either(
    IMPORT,
    EXPORT_DECLARATION,
    EXPORT_AS_NAMESPACE,
    EXPORT_EQUAL,
    EXPORT_FROM,
    DECLARATION,
    decl.DECLARATION,
    DECLARE_MODULE,
    DECLARE_GLOBAL,
    decl.INTERFACE_OR_CLASS // it really is just interface
  ))
