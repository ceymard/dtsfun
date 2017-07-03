
export interface Accessor<T, This> {
  (): T | null
  (arg: T | null): This
}

// function a(def: any): (target: Declaration, name: string) => void
function a(target: any, name?: string) {

  if (arguments.length > 1) return wrapped(target, name!)

  function wrapped(target: any, name: string, value = null) {
    target['_' + name] = value
    target[name] = function (this: any, arg?: any) {
      if (arguments.length > 0) {
        this['_' + name] = arg
        return this
      } else {
        return this['_' + name]
      }
    }
  }
}

export abstract class Node {

}

export abstract class Declaration extends Node {

  @a doc: Accessor<string, this>
  @a name: Accessor<string, this>
  @a is_export: Accessor<boolean, this>

}

export class Module extends Declaration {
  @a exports: Accessor<Declaration[], this>
}

export class SingleImportExport extends Node {
  @a name: Accessor<string, this>
  @a 'as': Accessor<string, this>
}

export class ImportList extends Node {
  @a imports: Accessor<SingleImportExport[], this>
  @a from_module: Accessor<string, this>
  // @a module: Accessor<Module, this>

  kind = 'import'
}

export class ExportList extends ImportList {
  kind = 'export'
}

export class Variable extends Declaration {
  @a kind: Accessor<string, this>
  @a type: Accessor<TypeLiteral, this> // a reference to a type.
}


export class TypeLiteral extends Node {
  @a array_number: Accessor<number, this>
}

export class UnionType extends TypeLiteral {
  @a types: Accessor<TypeLiteral[], this>
}

export class FunctionLiteral extends TypeLiteral {
  @a type_arguments: Accessor<TypeLiteral[], this>
  @a arguments: Accessor<Argument[], this>
  @a return_type: Accessor<TypeLiteral, this>
}


/**
 * A reference to a type. Will have to be resolved later.
 */
export class NamedType extends TypeLiteral {
  @a name: Accessor<string, this>
  @a type_arguments: Accessor<TypeLiteral[], this>
}

export class TypeDeclaration extends Declaration {

}

export class Class extends TypeDeclaration {

}

export class Interface extends TypeDeclaration {

}

export class Argument extends Declaration {
  @a type: Accessor<TypeLiteral, this>
  @a ellipsis: Accessor<boolean, this>
  @a optional: Accessor<boolean, this>
}

export class Function extends Declaration {
  @a type_arguments: Accessor<TypeLiteral[], this>
  @a arguments: Accessor<Argument[], this>
  @a return_type: Accessor<TypeLiteral, this>
}

export class GlobalAugmentations extends Node {
  @a augmentations: Accessor<Declaration[], this>
}


export class SourceFile extends Node {
  @a path: Accessor<string, this>
  @a declarations: Accessor<Declaration[], this>
}