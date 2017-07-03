
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
  render(indent = '') {
    return `${indent}[[${this.constructor.name}]]`
  }
}

export abstract class Declaration extends Node {

  @a doc: Accessor<string, this>
  @a name: Accessor<string, this>
  @a is_export: Accessor<boolean, this>

}

export class Module extends Declaration {
  @a exports: Accessor<Declaration[], this>
}

export class Import extends Node {
  @a name: Accessor<string, this>
  @a 'as': Accessor<string, this>

  render(indent = '') {
    var s = this.as()
    return `${indent}${this.name()}${s ? ` as ${s}` : ''}`
  }
}

export class ImportList extends Node {
  @a imports: Accessor<Import[], this>
  @a module_name: Accessor<string, this>
  @a module: Accessor<Module, this>

  render(indent = '') {
    return [
      indent,
      `import {\n`,
      this.imports()!.map(i => i.render(indent + '  ')).join(',\n'),
      '\n',
      indent,
      `} from ${this.module_name()}\n`
    ].join('')
  }
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

  render(indent = '') {
    var repr = str(this.types(), ' | ')
    var arr = ''
    var an = this.array_number()
    if (an) {
      for (var i = 0; i < an; i++) arr += '[]'
    }
    return `(${repr})${arr}`
  }
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

  render(indent = '') {
    return `${this.name()}`
  }
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

  render(indent: '') {
    return [
      opt(this.ellipsis(), '...'),
      this.name(),
      opt(this.optional(), '?'),
      ': ',
      str(this.type())
    ].join('')
  }
}

export class Function extends Declaration {
  @a type_arguments: Accessor<TypeLiteral[], this>
  @a arguments: Accessor<Argument[], this>
  @a return_type: Accessor<TypeLiteral, this>

  render(indent = '') {
    var t = this.type_arguments()
    var t_str = ''
    if (t != null) {
      t_str = `<${str(t)}>`
    }
    return [
      indent,
      opt(this.doc(), this.doc()!),
      opt(this.is_export(), 'export declare '),
      `function ${this.name()}`,
      t_str,
      `(${str(this.arguments())}): `,
      str(this.return_type()),
      ';'
    ].join('')
  }
}

export class GlobalAugmentations extends Node {
  @a augmentations: Accessor<Declaration[], this>

  render(indent = '') {
    return [
      indent,
      `declare global {\n${indent + '  '}`,
      str(this.augmentations(), '\n' + indent + '  '),
      `\n${indent}}\n`
    ].join('')
  }
}


//////////////////// HELPERS

function opt<T>(a: T, viz: string | ((a: T) => string)) {
  if (!a) return ''
  return typeof viz === 'function' ? viz(a) : viz
  
}

function str<T extends Node>(a: T | T[] | null, joiner = ', ') {
  if (a == null) return ''
  if (Array.isArray(a))
    return a.map((a: T) => a.render()).join(joiner)
  return a.render()
}
