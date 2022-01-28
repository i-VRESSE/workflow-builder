export function replaceItemAtIndex<V> (arr: V[], index: number, newValue: V): V[] {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

export function removeItemAtIndex<V> (arr: V[], index: number): V[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}
