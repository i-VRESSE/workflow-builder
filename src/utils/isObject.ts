export function isObject (o: unknown): boolean {
  return (
    typeof o === 'object' &&
    Object.prototype.toString.call(o) === '[object Object]'
  )
}
