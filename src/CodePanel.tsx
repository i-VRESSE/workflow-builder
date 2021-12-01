import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import style from 'react-syntax-highlighter/dist/esm/styles/prism/vs';

SyntaxHighlighter.registerLanguage('toml', toml);

import { useCode } from "./store"


export const CodePanel = () => {
    const code = useCode()

    function copy2clipboard() {
        // TODO check if allowed to write to clipboard
        navigator.clipboard.writeText(code)
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