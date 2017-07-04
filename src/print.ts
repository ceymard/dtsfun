
import {match} from './helpers'
import * as ast from './parser/ast'


function printExportList(exp: ast.ExportList) {
  
}


export function print(file: ast.SourceFile): string {
  return file.declarations!.map(decl => 
    match<ast.Node, string>(decl)
      .with(ast.ExportList, exp => null)
    .value()
  ).join('\n')
}
