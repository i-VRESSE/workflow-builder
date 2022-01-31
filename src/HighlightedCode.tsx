import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs'

SyntaxHighlighter.registerLanguage('toml', toml)

interface IProps {
  code: string
}

// TODO would be nice if text was editable and showed parameter description on hover and inline validation errors.
// TODO would be nice to be able to click in text to select node to edit.
export const HighlightedCode = ({ code }: IProps): JSX.Element => (
  <SyntaxHighlighter language='toml' style={style}>
    {code}
  </SyntaxHighlighter>
)
