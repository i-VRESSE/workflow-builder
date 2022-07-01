import React from 'react'
import { CatalogCategory } from './CatalogCategory'
import { CatalogPicker } from './CatalogPicker'
import { Example } from './Example'
import { useCatalog } from './store'

export const CatalogPanel = (): JSX.Element => {
  const catalog = useCatalog()
  return (
    <fieldset>
      <legend>Catalog</legend>
      <div>
        <CatalogPicker />
      </div>
      <React.Suspense fallback={<span>Loading catalog...</span>}>
        <h4>Nodes</h4>
        <ul style={{ lineHeight: '2.5em' }}>
          {catalog?.categories.map((category) => (
            <CatalogCategory key={category.name} {...category} />
          ))}
        </ul>
        <h4>Examples</h4>
        Workflow examples that can be loaded as a starting point.
        <ul>
          {Object.entries(catalog?.examples).map(([name, workflow]) => (
            <Example key={name} name={name} workflow={workflow} />
          ))}
        </ul>
      </React.Suspense>
    </fieldset>
  )
}
