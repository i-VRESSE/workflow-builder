import React from 'react'
import { useCatalog } from './store'

export const Header = (): JSX.Element => {
  const { title } = useCatalog()
  return (
    <h1>i-VRESSE workflow builder: {title}</h1>
  )
}
