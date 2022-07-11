import { useFiles, useWorkflow } from '@i-vresse/wb-core/dist/store'
import { IFiles, IWorkflow } from '@i-vresse/wb-core/dist/types'
import { toast } from 'react-toastify'

interface Data extends IWorkflow {
  files: IFiles
}

interface Subission {
  progressUrl: string
}

async function submit2api (url: string, data: Data): Promise<Subission> {
  const resp = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )
  if (!resp.ok) {
    throw new Error(resp.statusText)
  }
  return await resp.json()
}

export const useSubmit: (url?: string) => () => Promise<void> = (url = '/api/runs') => {
  const { global, nodes } = useWorkflow()
  const files = useFiles()
  return async () => {
    // TODO files are stored as base64 encoded strings, which is clunky, could switch to multipart form with blobs
    const data = { global, nodes, files }
    await toast.promise(
      submit2api(url, data),
      {
        pending: 'Submitting workfow ...',
        success: {
          render ({ data }: { data: Subission}) {
            // TODO instead of presenting link could redirect to progress page
            return (
              <div>
                <span>Workflow submitted successfully.</span>
                <a href={data.progressUrl}>Progress page</a>
              </div>
            )
          }
        },
        error: {
          render ({ data }) {
            console.error(data)
            return 'Workflow submission failed to load. See DevTools (F12) console for errors.'
          }
        }
      }, {
        autoClose: false
      }
    )
  }
}
