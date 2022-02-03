import React from 'react'

import { CatalogPicker } from './CatalogPicker'
import { CatalogCategory } from './CatalogCategory'
import { useCatalog, useWorkflow } from './store'
import { Example } from './Example'

export const CatalogPanel = (): JSX.Element => {
  const catalog = useCatalog()
  const { toggleGlobalEdit } = useWorkflow()
  return (
    <fieldset>
      <legend>Catalog</legend>
      <div>
        <CatalogPicker />
      </div>
      <React.Suspense fallback={<span>Loading catalog...</span>}>
        <button className='btn btn-light' onClick={toggleGlobalEdit}>Configure global parameters</button>
        <h4>Nodes</h4>
        <ul style={{ lineHeight: '2.5em' }}>
          {catalog?.categories.map((category) => <CatalogCategory key={category.name} {...category} />)}
        </ul>
        <h4>Examples</h4>
        Workflow examples that can be loaded as a starting point.
        <ul>
          {Object.entries(catalog?.examples).map(([name, workflow]) => <Example key={name} name={name} workflow={workflow} />)}
        </ul>
      </React.Suspense>
    </fieldset>
  )
}
