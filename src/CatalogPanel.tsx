import React from 'react'
import { CatalogPicker } from './CatalogPicker'
import { CatalogCategory } from './CatalogCategory'
import { useCatalog, useWorkflow } from './store'
import { TemplateNode } from './TemplateNode'

export const CatalogPanel = () => {
  const catalog = useCatalog()
  const { toggleGlobalEdit } = useWorkflow()
  return (
    <fieldset>
      <legend>Step catalog</legend>
      <CatalogPicker />
      <React.Suspense fallback={<span>Loading catalog...</span>}>
        <button className='btn btn-light' onClick={toggleGlobalEdit}>Configure global parameters</button>
        <h3>Nodes</h3>
        <ul>
          {catalog?.categories.map((category) => <CatalogCategory key={category.name} {...category} />)}
        </ul>
        <h3>Templates</h3>
        Workflow templates that can be loaded as a starting point.
        <ul>
          {Object.entries(catalog?.templates).map(([name, workflow]) => <TemplateNode key={name} name={name} workflow={workflow} />)}
        </ul>
      </React.Suspense>
    </fieldset>
  )
}
