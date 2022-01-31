import { load } from 'js-yaml'
import { ICatalog, IGlobal } from './types'
import { validateCatalog, ValidationError } from './validate'

export async function fetchCatalog (catalogUrl: string): Promise<ICatalog> {
  const response = await fetch(catalogUrl)
  if (!response.ok) {
    throw new Error('Error retrieving catalog')
  }
  const body = await response.text()
  const catalog = load(body)
  if (!isCatalog(catalog)) {
    throw new Error('Retrieved catalog is malformed')
  }
  const errors = validateCatalog(catalog)
  if (errors.length > 0) {
    throw new ValidationError('Invalid catalog loaded', errors)
  }
  // TODO Only report success when user initiated catalog loading, not when page is loaded
  // toast.success('Loading catalog completed')
  return catalog
}

export function isCatalog (catalog: unknown): catalog is ICatalog {
  return typeof catalog === 'object' &&
      catalog !== null &&
      'global' in catalog &&
      'nodes' in catalog
  // TODO add more checks
}

export function globalParameterKeys (global: IGlobal): Set<string> {
  let keys: string[] = []
  if (global?.schema.properties != null) {
    keys = Object.keys(global.schema.properties)
  }
  return new Set(keys)
}
