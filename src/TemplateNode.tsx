import { parse } from "@ltd/j-toml"
import { IStep, useWorkflow } from "./store"

interface IProps {
    name: string
    workflow: string
}

export const TemplateNode = ({ name, workflow }: IProps) => {
    const { loadWorkflow } = useWorkflow()
    return <li><button className="btn btn-light" onClick={() => loadWorkflow(workflow)} title={workflow}>{name}</button></li>
}