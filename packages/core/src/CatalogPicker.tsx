import React, { useEffect, useState } from 'react'
import { defaultCatalogIndexURL, fetchCatalog, fetchCatalogIndex } from './catalog'
import { CatalogPickerComponent } from './CatalogPicker.component'
import { useCatalog, useSetCatalog } from './store'
import { ICatalogIndex } from './types'

interface Props {
  catalogIndexURL?: string
}

export const CatalogPicker = ({ catalogIndexURL = defaultCatalogIndexURL }: Props): JSX.Element => {
  const [catalogIndex, setCatalogIndex] = useState<ICatalogIndex>([])
  const [catalogURL, setCatalogURL] = useState('')
  const catalog = useCatalog()
  const setCatalog = useSetCatalog()
  useEffect(() => {
    fetchCatalogIndex(catalogIndexURL).then(index => {
      setCatalogIndex(index)
      if (catalog.title === '') {
        // Select first catalog if no catalog is loaded yet
        setCatalogURL(index[0][1])
      }
    }).catch(e => { throw e })
  }, [catalogIndexURL])
  useEffect(() => {
    if (catalogURL !== '') {
      fetchCatalog(catalogURL).then(setCatalog).catch(e => { throw e })
    }
  }, [catalogURL])

  // TODO clear? workflow when switching catalogs
  return <CatalogPickerComponent index={catalogIndex} selected={catalogURL} onSelect={setCatalogURL} />
}
