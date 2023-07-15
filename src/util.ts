// Thanks to https://stackoverflow.com/questions/49752151/typescript-keyof-returning-specific-type
export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V? P: never]: any
}