
export abstract class Node {

  is<T extends Node>(kls: new (...a: any[]) => T): boolean {
    return this.constructor === kls
  }

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

}

export class ImportAs extends Node {
  name: string
  from_module: string
}

export class ExportList extends ImportList {

}

export class Variable extends Declaration {
  kind: string
  type: Type // a reference to 
}


export class Type extends Node {

}

export class UnionType extends Type {
  types: Type[]
}

export class FunctionLiteral extends Type {
  is_new = false
  type_parameters: TypeParameter[] = []
  arguments: Argument[] = []
  return_type: Type
}

export class TupleLiteral extends Type {
  types: Type[] = []
}

export class ObjectLiteral extends Type {
  members: Member[] = []
}

/**
 * A reference to a type. Will have to be resolved later.
 */
export class NamedType extends Type {
  name: string[] // Named types have potentially qualified names
  type_arguments: Type[] | null = null
}

export class StringType extends Type {
  string: string
}

export class NumberType extends Type {
  number: number
}

export class KeyOfType extends Type {
  type: Type
}

export class ArrayOfType extends Type {
  type: Type
}

export class IndexType extends Type {
  type: Type
  index_type: Type
}

export class TypeDeclaration extends Declaration {
  type: Type
  type_parameters: TypeParameter[] = []
}

export class TypeParameter extends Declaration {
  default: Type | null = null
  extends: Type | null = null
}

export class Argument extends Declaration {
  type: Type
  ellipsis: boolean
  optional: boolean
}

export class Function extends Declaration {
  type_parameters: TypeParameter[] = []
  arguments: Argument[] = []
  return_type: Type | null
}

export class Member extends Declaration {
  is_abstract: boolean = false
  is_static: boolean = false
  is_optional: boolean = false
  visibility: string // public, private or protected
}

export class Property extends Member {
  type: Type
}

export class DynamicProperty extends Property {
  key_type: Type
}

export class Method extends Member implements Function {
  is_new = false
  type_parameters: TypeParameter[] = []
  arguments: Argument[] = []
  return_type: Type | null = null
}

export class MemberHolder extends Declaration {
  members: Member[] = []
}

export class Implementer extends MemberHolder {
  is_abstract: boolean = false
  extends: Type | null = null
  implements: Type[] = []
  type_parameters: TypeParameter[] = []
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