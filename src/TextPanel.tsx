import { FilesList } from './FilesList'
import { HighlightedCode } from './HighlightedCode'

import { useText } from './store'

// TODO highlighter is 1/3 of dist/vendor.js, look for lighter alternative
// Already tried to use dynamic import:
// const HighlightedCode = lazy(async () => await import('./HighlightedCode'))
// which resulted in over 300 dist/*.js chunks, which is not wanted

export const TextPanel = (): JSX.Element => {
  const code = useText()

  async function copy2clipboard (): Promise<void> {
    await navigator.permissions.query({ name: 'clipboard-write' } as any)
    await navigator.clipboard.writeText(code)
  }

  // TODO would be nice if text was editable and showed parameter description on hover and inline validation errors.
  // TODO would be nice to be able to click in text to select step to edit.
  return (
    <div>
      <HighlightedCode code={code} />
      <button className='btn btn-link' onClick={copy2clipboard}>Copy to clipboard</button>
      <FilesList />
    </div>
  )
}
