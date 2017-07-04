
import {_, SequenceOf, Optional, Either, List, ZeroOrMore, Rule, Lexeme, SequenceRule, ZeroOrMoreRule} from 'pegp'
import {K, T, multi_line_comment} from './base'
import {var_decl, function_decl} from './declarations'
import * as ast from './ast'

export const
    single_import_or_export = SequenceOf(
      T.id, 
      Optional(_(K.as, T.id))
    )
                                  .tf(([id, as_id]) => 
                                    new ast.SingleImportExport().set({name: id.text, as: as_id ? as_id.text : ''})
                                  ),

  export_rule = SequenceOf(
    multi_line_comment,
    _(K.export, Optional(K.declare), Either(
      var_decl,
      function_decl
    ) as Rule<ast.Declaration>) // we have to type it because Partial<> doesn't do well with union types.
  ).tf(([comment, decl]) => decl.set({doc: comment, is_export: true})),


  from_clause = SequenceOf(K.from, T.string).tf(([k, str]) => str.text),


  export_from = SequenceOf(
    _(K.export, Either(
      SequenceOf(
        _(T.lbrace, List(single_import_or_export, T.comma)),
        T.rbrace,
      ).tf(([lst]) => lst),
      T.star.tf(star => [new ast.SingleImportExport().set({name: '*'})])
    )),
    from_clause
  ).tf(([imports, from_module]) => 
    new ast.ExportList().set({imports, from_module})
  ),

  import_rule = SequenceOf(
    _(K.import, T.lbrace, List(single_import_or_export, T.comma)),
    _(T.rbrace, from_clause)
  ).tf(([imports, from_module]) => 
    new ast.ImportList().set({imports, from_module})
  ),

  global = SequenceOf(K.global),

  // Inline module declaration in a file of modules
  module_decl = SequenceOf(
    multi_line_comment,
    K.declare,
    K.module,
    T.id, // module name
    T.lbrace,
    ZeroOrMore(Either(
      import_rule,
      export_rule,
      global
    )),
    T.rbrace
  ),

  top_level_decl = ZeroOrMore(Either(
    import_rule,
    export_rule,
    export_from,
    SequenceOf(_(K.declare, K.global, T.lbrace, ZeroOrMore(function_decl)), T.rbrace)
      .tf(([decls]) => new ast.GlobalAugmentations().set({augmentations: decls}))
  ))
