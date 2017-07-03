

export class Matcher<T, U> {
  constructor(public instance: T) { }

  with<Y extends T>(type: new (...a: any[]) => Y, cbk: (a: Y) => U) {
    return this
  }

  value(): U {
    // Run the whole thing.
  }
}

export function match<T, U>(instance: T): Matcher<T, U> {
  return new Matcher<T, U>(instance)
}
