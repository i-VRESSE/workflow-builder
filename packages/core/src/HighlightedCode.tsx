import React from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs'

SyntaxHighlighter.registerLanguage('toml', toml)

export interface IProps {
  /**
   * The piece of code in TOML format
   */
  code: string
  onClick?: (lineNumber: number) => void
}

/**
 * Render piece of TOML formatted text in colors.
 */
export const HighlightedCode = ({ code, onClick }: IProps): JSX.Element => (
  <div id='highlightedcode'>
    <SyntaxHighlighter
      language='toml'
      style={style}
      wrapLines
      lineProps={lineNumber => ({
        style: { display: 'block', cursor: 'pointer' },
        onClick () {
          if (onClick != null) {
            onClick(lineNumber)
          }
        }
      })}
      // onClick only works with showLineNumbers, so enable and hide
      showLineNumbers
      lineNumberStyle={(props) => {
        return {
          display: 'none'
        }
      }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
)
