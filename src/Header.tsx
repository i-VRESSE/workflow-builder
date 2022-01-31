import { useCatalog } from './store'

export const Header = (): JSX.Element => {
  const { title } = useCatalog()
  return (
    <h1 style={{ height: '1em' }}>i-VRESSE workflow builder: {title}</h1>
  )
}
