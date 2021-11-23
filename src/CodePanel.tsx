import { useCode } from "./store"

export const CodePanel = () => {
    const code = useCode()
    return (
        <div>
            <div>Toml representation of workflow</div>
            <pre>
                {code}
            </pre>
        </div>
    )
}