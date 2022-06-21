export function isObject (o: unknown): o is Object {
  return (
    typeof o === 'object' &&
    Object.prototype.toString.call(o) === '[object Object]'
  )
}
