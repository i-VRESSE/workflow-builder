import { useCatalogIndex, useCatalogURL } from './store'

export const CatalogPicker = (): JSX.Element => {
  const catalogIndex = useCatalogIndex()
  const [url, setURL] = useCatalogURL()
  // TODO clear? workflow when switching catalogs
  return (
    <select title='Select another catalog' className='form-control' style={{ width: 'auto' }} value={url} onChange={(e) => setURL(e.target.value)}>
      {catalogIndex.map(([k, v]) => <option key={v} value={v}>{k}</option>)}
    </select>
  )
}
