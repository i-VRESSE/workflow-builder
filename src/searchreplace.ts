function isObject(data: unknown): data is Object {
  return Object.prototype.toString.call(data) === "[object Object]";
}

export function walk(
  data: unknown,
  searcher: (d: string) => boolean,
  replacer: (d: string) => string
): any {
  if (Array.isArray(data)) {
    return data.map((d) => walk(d, searcher, replacer));
  } else if (isObject(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, walk(v, searcher, replacer)])
    );
  } else if (typeof data === "string" && searcher(data)) {
    return replacer(data);
  }
  return data;
}
