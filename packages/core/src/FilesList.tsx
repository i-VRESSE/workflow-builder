import React from 'react'
import { saveAs } from 'file-saver'
import { useFiles } from './store'

export const FilesList = (): JSX.Element => {
  const files = useFiles()
  const fileList = Object.keys(files)

  function downloadFile (filename: string): void {
    saveAs(files[filename], filename)
  }

  if (fileList?.length === 0) {
    return (
      <div style={{
        padding: '0.5rem'
      }}
      >
        <h5>No files to show</h5>
      </div>
    )
  }

  return (
    <div style={{
      padding: '0.5rem'
    }}
    >
      <h5>Files</h5>
      <ul>
        {fileList.map(filename =>
          <li key={filename}><button className='btn btn-link' onClick={() => downloadFile(filename)}>{filename}</button></li>
        )}
      </ul>
    </div>
  )
}
