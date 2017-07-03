
export interface Accessor<T, This> {
  (): T | null
  (arg: T | null): This
}

// function a(def: any): (target: Declaration, name: string) => void
function a(target: Declaration, name: string): void
function a(value: any, name?: string) {

  if (arguments.length > 1) return wrapped(value, name!)

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

export abstract class Declaration {

  @a doc: Accessor<string, this>
  @a name: Accessor<string, this>

}

export class Module extends Declaration {
  @a exports: Accessor<Declaration[], this>
}

export class Variable extends Declaration {
  @a kind: Accessor<string, this>
  @a type: Accessor<Type, this> // a reference to a type.
}


export class Type extends Declaration {
  @a type_arguments: Accessor<Type[], this>
}

export class Class extends Type {

}

export class Interface extends Type {

}

export class Argument extends Declaration {
  @a type: Accessor<Type, this>
}

export class Function extends Declaration {
  @a type_arguments: Accessor<Type[], this>
  @a arguments: Accessor<Argument[], this>
  @a return_type: Accessor<Type, this>
}