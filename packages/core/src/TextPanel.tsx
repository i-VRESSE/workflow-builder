import React from 'react'
import { HighlightedCode } from './HighlightedCode'

import { useText, useWorkflow } from './store'
import { lines2node } from './toml'

// TODO highlighter is 1/3 of dist/vendor.js, look for lighter alternative
// Already tried to use dynamic import:
// const HighlightedCode = lazy(async () => await import('./HighlightedCode'))
// which resulted in over 300 dist/*.js chunks, which is not wanted

export const TextPanel = (): JSX.Element => {
  const code = useText()
  const { selectNode, selectGlobalEdit } = useWorkflow()

  async function copy2clipboard (): Promise<void> {
    await navigator.permissions.query({ name: 'clipboard-write' } as any)
    await navigator.clipboard.writeText(code)
  }

  function onClickLine (lineNumber: number): void {
    const lookup = lines2node(code)
    const nodeIndex = lookup[lineNumber]
    if (nodeIndex === -1) {
      selectGlobalEdit()
    } else {
      selectNode(nodeIndex)
    }
  }

  return (
    <div style={{
      position: 'relative'
    }}
    >
      <HighlightedCode code={code} onClick={onClickLine} />
      <button
        className='btn btn-link'
        style={{
          position: 'absolute',
          right: '0.25rem',
          top: '0.75rem'
        }}
        onClick={copy2clipboard as any}
      >
        Copy to clipboard
      </button>
    </div>
  )
}
