import { saveAs } from 'file-saver'
import { useFiles } from './store'

export const FilesList = () => {
  const { files } = useFiles()

  function downloadFile (filename: string) {
    saveAs(files[filename], filename)
  }

  return (
    <div>
      <h5>Files</h5>
      <ul>
        {Object.entries(files).map(([filename, body]) =>
          <li key={filename}><button className='btn btn-link' onClick={() => downloadFile(filename)}>{filename}</button></li>
        )}
      </ul>
    </div>
  )
}
