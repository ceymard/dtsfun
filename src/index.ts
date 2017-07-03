
import {
  SequenceOf, Language, Either, List, Optional, Rule, ZeroOrMore
} from 'pegp'

import * as ast from './ast'

////////////////////////////////////////////
// Language rules.
const


  single_import_or_export = SequenceOf(T.id, Optional(SequenceOf(K.as, T.id).tf(([ask, id]) => id)))
    .tf(([id, as_id]) => 
      new ast.SingleImportExport()
        .name(id.text)
        .as(as_id ? as_id.text : null)
    ),

  export_rule = SequenceOf(
    multi_line_comment,
    K.export, 
    Optional(K.declare), 
    Either(
      var_decl,
      function_decl
    )
  ).tf(([comment, kex, kdecl, decl]) => decl.doc(comment).is_export(true)),


  from_clause = SequenceOf(K.from, T.string).tf(([k, str]) => str.text),

  export_from = SequenceOf(
    K.export,
    Either(
      SequenceOf(
        T.lbrace,
        List(single_import_or_export, T.comma),
        T.rbrace,
      ).tf(([lb, lst, rb]) => lst),
      T.star.tf(star => [new ast.SingleImportExport().name('*')])
    ),
    from_clause
  ).tf(([ik, exports, mod_name]) => 
    new ast.ExportList()
    .imports(exports)
    .from_module(mod_name)
  ),

  import_rule = SequenceOf(
    K.import,
    T.lbrace,
    List(single_import_or_export, T.comma),
    T.rbrace,
    from_clause
  ).tf(([ik, lb, imports, rb, mod_name]) => 
    new ast.ImportList()
      .imports(imports)
      .from_module(mod_name)
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
    SequenceOf(K.declare, K.global, T.lbrace, ZeroOrMore(function_decl), T.rbrace)
      .tf(([k1, k2, k3, decls, k4]) => new ast.GlobalAugmentations().augmentations(decls))
  ))

/**
 * A tsd file contains either a declaration of several modules
 * or directly exports (optionally with some sub-module declarations...)
 */
const TSD = Language(top_level_decl, tl)

//////// TEMP
const fs = require('fs')
const res = fs.readFileSync('/dev/stdin', 'utf-8')
var result = TSD.parse(res)
console.log(result)
