
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
  type_arguments: TypeLiteral[] | null = null
  arguments: Argument[] | null = null
  return_type: TypeLiteral
}


/**
 * A reference to a type. Will have to be resolved later.
 */
export class NamedType extends TypeLiteral {
  name: string
  type_arguments: TypeLiteral[] | null = null
}

export class TypeDeclaration extends Declaration {

}

export class Class extends TypeDeclaration {

}

export class Interface extends TypeDeclaration {

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

export class GlobalAugmentations extends Node {
  augmentations: Declaration[]
}


export class SourceFile extends Node {
  path: string
  declarations: Declaration[]
}