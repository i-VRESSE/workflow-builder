import React from 'react'
import { ICatalogIndex } from './types'

export interface Props {
  index: ICatalogIndex
  selected: string
  onSelect: (selected: string) => void
}

export const CatalogPickerComponent = ({
  index,
  selected,
  onSelect
}: Props): JSX.Element => {
  return (
    <div>
      {index.length === 0 && <span>Loading catalog index...</span>}
      <select
        title='Select another catalog'
        className='form-control'
        style={{ width: 'auto' }}
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
      >
        {index.map(([k, v]) => (
          <option key={v} value={v}>
            {k}
          </option>
        ))}
      </select>
    </div>
  )
}
