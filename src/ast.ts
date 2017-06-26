

export abstract class Declaration {
  name: string
  doc: string
}

export class Module extends Declaration {
  exports: Declaration[]
}

export class Variable extends Declaration {
  type: Type // a reference to a type.
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