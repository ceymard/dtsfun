
export interface Accessor<T, This> {
  (): T
  (arg: T): This
}

function a(target: any, name: string) {
  target[name] = function (this: any, arg?: any) {
    if (typeof arg !== 'undefined') {
      this['_' + name] = arg
      return this
    } else {
      return this['_' + name]
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
  _type: Type // a reference to a type.
}


export class Type extends Declaration {

}

export class Class extends Type {

}

export class Interface extends Type {

}

export class Argument extends Declaration {
  constructor({name}: {name: string}) { super() }
}

export class Function extends Declaration {
  arguments: Argument[]
  type: Type
}