import React from 'react'
import { useCatalog } from './store'

/**
 * Header with title of catalog
 */
export const Header = (): JSX.Element => {
  const { title } = useCatalog()
  return (
    <h1>i-VRESSE workflow builder: {title}</h1>
  )
}
