import { useRecoilState } from 'recoil'
import { catalogURLchoices } from './constants'
import { catalogURLState } from './store'

export const CatalogPicker = () => {
  const [url, setURL] = useRecoilState(catalogURLState)
  // TODO clear workflow when switching catalogs
  return (
    <select value={url} onChange={(e) => setURL(e.target.value)}>
      {catalogURLchoices.map(([k, v]) => <option key={v} value={v}>{k}</option>)}
    </select>
  )
}
