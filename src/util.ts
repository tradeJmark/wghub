// Thanks to https://stackoverflow.com/questions/49752151/typescript-keyof-returning-specific-type
export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V? P: never]: any
}

export function unzip<T>(list: [T, T][]): [T[], T[]] {
  const a: T[] = []
  const b: T[] = []
  list.forEach(([x, y]) => {
    a.push(x)
    b.push(y)
  })
  return [a, b]
}

export const ipv4RegExpPartial = /\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?/
export const ipv4RegExp = RegExp(`^${ipv4RegExpPartial.source}$`)
export const ipv4RegExpOptional = RegExp(`^(${ipv4RegExpPartial.source})?$`)