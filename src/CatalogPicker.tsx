import { useRecoilState, useRecoilValue } from 'recoil'

import { catalogURLState, catalogIndexState } from './store'

export const CatalogPicker = (): JSX.Element => {
  const catalogIndex = useRecoilValue(catalogIndexState)
  const [url, setURL] = useRecoilState(catalogURLState)
  // TODO clear? workflow when switching catalogs
  return (
    <select value={url} onChange={(e) => setURL(e.target.value)}>
      {catalogIndex.map(([k, v]) => <option key={v} value={v}>{k}</option>)}
    </select>
  )
}
