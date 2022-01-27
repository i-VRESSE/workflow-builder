import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs'
import { FilesList } from './FilesList'

import { useText } from './store'

SyntaxHighlighter.registerLanguage('toml', toml)

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
      <SyntaxHighlighter language='toml' style={style}>
        {code}
      </SyntaxHighlighter>
      <button className='btn btn-link' onClick={copy2clipboard}>Copy to clipboard</button>
      <FilesList />
    </div>
  )
}
