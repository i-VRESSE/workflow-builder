import { load } from 'js-yaml'
import { groupCatalog } from './grouper'
import { ICatalog, ICatalogIndex, IGlobal } from './types'
import { validateCatalog, ValidationError } from './validate'

export async function fetchCatalog (catalogUrl: string): Promise<ICatalog> {
  const response = await fetch(catalogUrl)
  if (!response.ok) {
    throw new Error('Error retrieving catalog')
  }
  const body = await response.text()
  const unGroupedCatalog = load(body)

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
}

export function globalParameterKeys (global: IGlobal): Set<string> {
  let keys: string[] = []
  if (global?.schema.properties != null) {
    keys = Object.keys(global.schema.properties)
  }
  return new Set(keys)
}

function isCatalogIndex (thing: unknown): thing is ICatalogIndex {
  return (
    Array.isArray(thing) &&
    thing.every((t) =>
      Array.isArray(t) &&
      t.length === 2 &&
      t.every(s => typeof s === 'string'))
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
