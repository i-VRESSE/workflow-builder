import { saveAs } from 'file-saver'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs'

import { useFiles, useText } from './store'

SyntaxHighlighter.registerLanguage('toml', toml)

export const TextPanel = () => {
  const code = useText()
  const { files } = useFiles()

  async function copy2clipboard () {
    await navigator.permissions.query({ name: 'clipboard-write' } as any)
    await navigator.clipboard.writeText(code)
  }
  function downloadFile (filename: string) {
    saveAs(files[filename], filename)
  }

  return (
    <div>
      <SyntaxHighlighter language='javascript' style={style}>
        {code}
      </SyntaxHighlighter>
      <button className='btn btn-link' onClick={copy2clipboard}>Copy to clipboard</button>
      <div>
        <h5>Files</h5>
        <ul>
          {Object.entries(files).map(([filename, body]) =>
            <li key={filename}><button className='btn btn-link' onClick={() => downloadFile(filename)}>{filename}</button></li>
          )}
        </ul>
      </div>
    </div>
  )
}
