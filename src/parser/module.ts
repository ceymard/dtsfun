
import {LastOf, SequenceOf, Optional, Either, List, ZeroOrMore, Rule, Lexeme, SequenceRule, ZeroOrMoreRule} from 'pegp'
import {K, T, MULTI_COMMENT} from './base'
import * as decl from './declarations'
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
    LastOf(K.import, T.lbrace, List(SINGLE_IMPORT_EXPORT, T.comma)),
    LastOf(T.rbrace, FROM_CLAUSE)
  ).tf(([imports, from_module]) => 
    new ast.ImportList().set({imports, from_module})
  ),


  GLOBAL = SequenceOf(K.global),


  MODULE_CONTENTS = ZeroOrMore(Either(
    IMPORT,
    EXPORT_DECLARATION,
    GLOBAL
  )),


  // Inline module declaration in a file of modules
  MODULE = SequenceOf(
    MULTI_COMMENT,
    LastOf(K.declare, K.module, T.id), // module name
    LastOf(T.lbrace, MODULE_CONTENTS),
    T.rbrace
  ),

  DECLARE_GLOBAL = SequenceOf(
    LastOf(K.declare, K.global, T.lbrace, ZeroOrMore(decl.DECLARATION)),
    T.rbrace
  ).tf(([decls]) => new ast.GlobalAugmentations().set({declarations: decls})),

  TOP_LEVEL = ZeroOrMore(Either(
    IMPORT,
    EXPORT_DECLARATION,
    EXPORT_FROM,
    DECLARE_GLOBAL
  ))
