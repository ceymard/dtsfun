
export abstract class Node {

  set(values: Partial<this>): this
  set<T extends keyof this>(prop: T, value: this[T]): this 
  set(values: any, single_val?: any) {
    var _this: any = this
    if (arguments.length === 1) {
      for (var x in values)
        _this[x] = values[x]
    } else {
      _this[values] = single_val
    }
    return this
  }

}

export abstract class Declaration extends Node {

  doc: string
  name: string
  is_export: boolean

}

export class Module extends Declaration {
  exports: Declaration[]
}

export class SingleImportExport extends Node {
  name: string
  'as': string
}

export class ImportList extends Node {
  imports: SingleImportExport[]
  from_module: string
  // module: Module

  kind = 'import'
}

export class ExportList extends ImportList {
  kind = 'export'
}

export class Variable extends Declaration {
  kind: string
  type: TypeLiteral // a reference to 
}


export class TypeLiteral extends Node {
  array_number: number
}

export class UnionType extends TypeLiteral {
  types: TypeLiteral[]
}

export class FunctionLiteral extends TypeLiteral {
  type_arguments: TypeLiteral[] = []
  arguments: Argument[] = []
  return_type: TypeLiteral
}

export class TupleLiteral extends TypeLiteral {
  types: TypeLiteral[] = []
}

/**
 * A reference to a type. Will have to be resolved later.
 */
export class NamedType extends TypeLiteral {
  name: string
  type_arguments: TypeLiteral[] | null = null
}

export class TypeDeclaration extends Declaration {
  name: string
  type: TypeLiteral
}

export class Argument extends Declaration {
  type: TypeLiteral
  ellipsis: boolean
  optional: boolean
}

export class Function extends Declaration {
  type_arguments: TypeLiteral[] = []
  arguments: Argument[] = []
  return_type: TypeLiteral
}

export class Member extends Declaration {
  is_static: boolean
  visibility: string // public, private or protected
}

export class Property extends Member {
  type: TypeLiteral
}

export class Method extends Member implements Function {
  type_arguments: TypeLiteral[] = []
  arguments: Argument[] = []
  return_type: TypeLiteral
}

export class MemberHolder extends Declaration {
  members: Member[] = []
}

export class Implementer extends MemberHolder {
  extends: TypeLiteral | null = null
  implements: TypeLiteral[] = []
  generic_arguments: TypeLiteral[] = []
}

export class Interface extends Implementer { }
export class Class extends Implementer { }


export class DeclarationHolder extends Declaration {
  declarations: Declaration[] = []
}

export class GlobalAugmentations extends DeclarationHolder {

}


export class Namespace extends DeclarationHolder {
  name: string
}


export class SourceFile extends DeclarationHolder {
  path: string
}