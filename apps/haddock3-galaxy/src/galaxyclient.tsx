import * as tus from 'tus-js-client'

/*
 * Methods to interact with galaxy project instance running at /
 */

// TODO publish galaxy client functions in a npm package

export async function createHistory (): Promise<string> {
  const res = await fetch('/api/histories', {
    method: 'POST'
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const body: { id: string } = await res.json()
  return body.id
}
export async function uploadZip (zip: Blob): Promise<string> {
  const tusEndpoint = '/api/upload/resumable_upload/'

  return await new Promise<string>((resolve, reject) => {
    const upload = new tus.Upload(zip, {
      endpoint: tusEndpoint,
      chunkSize: 10485760,
      onSuccess: function () {
        if (upload.url !== null) {
          const sessionId = upload.url.split('/').at(-1)
          if (sessionId !== undefined) {
            resolve(sessionId)
          }
        }
      },
      onError: reject
    })
    upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }

      // Start the upload
      upload.start()
    }).catch(reject)
  })
}
export async function addUpload2History (
  uploadSessionId: string,
  historyId: string
): Promise<string> {
  const fileName = 'docking-protein-ligand.zip'
  const data = {
    history_id: historyId,
    targets: [
      {
        destination: { type: 'hdas' },
        elements: [
          {
            src: 'files',
            name: fileName,
            dbkey: '?',
            ext: 'auto',
            space_to_tab: false,
            to_posix_lines: true
          }
        ]
      }
    ],
    auto_decompress: true,
    'files_0|file_data': {
      session_id: uploadSessionId,
      name: fileName
    }
  }
  const res = await fetch('/api/tools/fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const body = await res.json()
  console.log(body)
  return body.jobs[0].id
}

async function sleeper (delay = 500): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}
export async function waitForJob (id: string, attempts = 20): Promise<Job> {
  const errorStates = new Set(['deleted', 'deleting', 'error'])
  for (let index = 0; index < attempts; index++) {
    const job = await fetchJob(id)
    if (job.state === 'ok') {
      return job
    }
    if (errorStates.has(job.state)) {
      console.error(job)
      throw Error('Job failed')
    }
    await sleeper()
  }
  throw Error('Can wait no longer')
}

interface Job {
  state: string
  outputs: {
    html_file: {
      id: string
    }
    output0: {
      id: string
    }
  }
}

async function fetchJob (id: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${id}`)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const body: Job = await res.json()
  console.log(body)
  return body
}

export async function submitHaddock (historyId: string, uploadJobId: any): Promise<string> {
  const url = '/api/tools'
  const configFileName = 'workflow.cfg'
  const archiveFileName = 'docking-protein-ligand.zip'
  const toolId = 'haddock3html'
  const toolVersion = '1.0.0'
  const data = {
    history_id: historyId,
    tool_id: toolId,
    tool_version: toolVersion,
    inputs: {
      archive: {
        values: [
          {
            id: uploadJobId,
            hid: 1,
            name: archiveFileName,
            tags: [],
            src: 'hda',
            keep: false
          }
        ],
        batch: false
      },
      recipe: configFileName
    }
  }
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const body = await res.json()
  console.log(body)
  return body.jobs[0].id
}
