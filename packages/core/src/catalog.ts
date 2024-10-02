import { load } from 'js-yaml'
import { groupCatalog } from './grouper'
import { ICatalog, ICatalogIndex, IGlobal } from './types'
import { validateCatalog, ValidationError } from './validate'

/**
 * URL where catalog index can be found. Defaults to `/catalog/index.json` relative to the `import.meta.url`.
 */
export const defaultCatalogIndexURL = new URL(
  '/catalog/index.json',
  import.meta.url
).href

export async function fetchCatalog (catalogUrl: string): Promise<ICatalog> {
  const response = await fetch(catalogUrl)
  if (!response.ok) {
    throw new Error('Error retrieving catalog')
  }
  const yamlText = await response.text()
  const body = load(yamlText)

  // TODO move prepare to store.useSetCatalog
  return prepareCatalog(body)
}

/**
 *
 * @param unGroupedCatalog
 * @returns
 */
export function prepareCatalog (unGroupedCatalog: unknown): ICatalog {
  if (!isCatalog(unGroupedCatalog)) {
    throw new Error('Retrieved catalog is malformed')
  }
  const catalog = groupCatalog(unGroupedCatalog)
  const errors = validateCatalog(catalog)
  if (errors.length > 0) {
    throw new ValidationError('Invalid catalog loaded', errors)
  }
  return catalog
}

export function isCatalog (catalog: unknown): catalog is ICatalog {
  return (
    typeof catalog === 'object' &&
    catalog !== null &&
    'global' in catalog &&
    'nodes' in catalog
  )
  // TODO add more checks
  // check keys in global
  // check keys in each node
}

export function globalParameterKeys (global: IGlobal): Set<string> {
  let keys: string[] = []
  if (global?.schema.properties != null) {
    keys = Object.keys(global.schema.properties)
  }
  if (global?.schema.then !== undefined && typeof global.schema.then !== 'boolean' && global.schema.then.properties !== undefined) {
    keys = [...keys, ...Object.keys(global.schema.then.properties)]
  }
  if (global?.schema.else !== undefined && typeof global.schema.else !== 'boolean' && global.schema.else.properties !== undefined) {
    keys = [...keys, ...Object.keys(global.schema.else.properties)]
  }
  return new Set(keys)
}

function isCatalogIndex (thing: unknown): thing is ICatalogIndex {
  return (
    Array.isArray(thing) &&
    thing.every(
      (t) =>
        Array.isArray(t) &&
        t.length === 2 &&
        t.every((s) => typeof s === 'string')
    )
  )
}

export async function fetchCatalogIndex (
  catalogIndexURL: string
): Promise<ICatalogIndex> {
  const response = await fetch(catalogIndexURL)
  if (!response.ok) {
    throw new Error('Error retrieving catalog index')
  }
  const body = await response.json()
  if (!isCatalogIndex(body)) {
    throw new Error('Retrieved catalog index is malformed')
  }
  // Make URLs relative to app
  return body.map(([k, v]) => [k, new URL(v, import.meta.url).href])
}
