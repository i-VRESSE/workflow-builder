import React, { PropsWithChildren } from 'react'
import { CatalogCategory } from './CatalogCategory'
import { Example } from './Example'
import { useCatalog } from './store'

/**
 * Panel where nodes and examples of catalog are listed.
 * 
 * Catalog is retrieved from store.
 */
export const CatalogPanel = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const catalog = useCatalog()
  return (
    <fieldset>
      <legend>Catalog</legend>
      <React.Suspense fallback={<span>Loading catalog...</span>}>
        {children}
        <h4>Nodes</h4>
        <ul style={{ lineHeight: '2.5em' }}>
          {catalog.categories.map((category) => (
            <CatalogCategory key={category.name} {...category} />
          ))}
        </ul>
        {Object.entries(catalog.examples).length > 0 && (
          <div>
            <h4>Examples</h4>
            Workflow examples that can be loaded as a starting point.
            <ul>
              {Object.entries(catalog.examples).map(([name, workflow]) => (
                <Example key={name} name={name} workflow={workflow} />
              ))}
            </ul>
          </div>
        )}
      </React.Suspense>
    </fieldset>
  )
}
