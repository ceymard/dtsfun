
export abstract class Visitor {

  constructor() {
    for (var name of Object.getOwnPropertyNames(this)) {
      console.log(name)
      // Reflect.getMetadata('design:paramtypes')
    }
  }

  initTypeCache() {

  }

}
