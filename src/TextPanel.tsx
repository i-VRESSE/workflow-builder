import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs';

SyntaxHighlighter.registerLanguage('toml', toml);

import { useText } from "./store"


export const TextPanel = () => {
    const code = useText()

    async function copy2clipboard() {
        await navigator.permissions.query({name: "clipboard-write"} as any)
        await navigator.clipboard.writeText(code)
    }

    return (
        <div>
            <SyntaxHighlighter language="javascript" style={style}>
                {code}
            </SyntaxHighlighter>
            <button className="btn btn-link" onClick={copy2clipboard}>Copy to clipboard</button>
        </div>
    )
}