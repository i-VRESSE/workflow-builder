import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs'

SyntaxHighlighter.registerLanguage('toml', toml)

interface IProps {
  code: string
}

export const HighlightedCode = ({ code }: IProps): JSX.Element => (
  <div id='highlightedcode'>
    <SyntaxHighlighter language='toml' style={style}>
      {code}
    </SyntaxHighlighter>
  </div>
)
