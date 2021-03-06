
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

export class Reference extends Node {
  module_path: string
}

export abstract class Declaration extends Node {
  doc: string
  name: string
  is_export: boolean
  is_declare: boolean
}

export class Module extends Declaration {
  contents: Node[]
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

export class ExportAsNamespace extends Node {
  name_reference: NameReference
}

export class ImportEquals extends Node {
  name: string
  name_reference: NameReference
}

export class ExportEquals extends Node {
  name_reference: NameReference
}

export class Variable extends Declaration {
  kind: string
  type: Type | null = null // a reference to 
  value: string | number | NameReference | null = null // this is optional
}

export class NameReference extends Node {
  reference: string[]
}


export class Type extends Node {

}

export class UnionType extends Type {
  types: Type[]
}

export class IntersectionType extends Type {
  types: Type[]
}

export class TypeOf extends Type {
  type: Type
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
  name_reference: NameReference // Named types have potentially qualified names
  type_arguments: Type[] | null = null
}

export class StringType extends Type {
  string: string
}

export class NumberType extends Type {
  number: number
}

export class TypeModifier extends Type {
  type: Type
}

export class IsType extends Type {
  name: string
  type: Type
}

export class KeyOfType extends TypeModifier { }

export class ArrayOfType extends TypeModifier { }

export class IndexType extends TypeModifier {
  index_type: Type
}

export class TypeDeclaration extends Declaration {
  type: Type
  type_parameters: TypeParameter[] = []
}

export class Enum extends TypeDeclaration {
  is_const = false
  members: EnumMember[] = []
}

export class EnumMember extends Declaration {
  name: string
  value: string | number | null = null
}


export class TypeParameter extends Declaration {
  default: Type | null = null
  extends: Type | null = null
}

export class Argument extends Declaration {
  type: Type | null = null
  ellipsis: boolean
  optional: boolean
}

export class Function extends Declaration {
  type_parameters: TypeParameter[] = []
  arguments: Argument[] = []
  return_type: Type | null = null
  is_generator = false
}

export class Member extends Declaration {
  is_abstract: boolean = false
  is_static: boolean = false
  is_optional: boolean = false
  is_readonly: boolean = false
  visibility: string = '' // public, private or protected
}

export class Property extends Member {
  type: Type | null = null
}

export class IndexProperty extends Property {
  key_type: Type
}

export class Method extends Member implements Function {
  is_new = false
  type_parameters: TypeParameter[] = []
  arguments: Argument[] = []
  return_type: Type | null = null
  is_generator = false
}

export class MemberHolder extends Declaration {
  members: Member[] = []
}

export class Implementer extends MemberHolder {
  is_abstract: boolean = false
  extends: Type[] = []
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

}


export class SourceFile extends DeclarationHolder {
  path: string
}