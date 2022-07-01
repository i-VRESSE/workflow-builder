export function replaceItemAtIndex<V> (arr: V[], index: number, newValue: V): V[] {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

export function removeItemAtIndex<V> (arr: V[], index: number): V[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

export function removeAllItems<V> (arr: V[]): V[] {
  arr = []
  return arr
}

export function moveItem<V> (arr: V[], sourceIndex: number, targetIndex: number): V[] {
  const newArr = [...arr]
  const sourceNode = newArr.splice(sourceIndex, 1)[0]
  newArr.splice(targetIndex, 0, sourceNode)
  return newArr
}
