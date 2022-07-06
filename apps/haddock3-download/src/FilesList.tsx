import { saveAs } from 'file-saver'
import { useFiles } from './store'

export const FilesList = (): JSX.Element => {
  const files = useFiles()

  function downloadFile (filename: string): void {
    saveAs(files[filename], filename)
  }

  return (
    <div>
      <h5>Files</h5>
      <ul>
        {Object.keys(files).map(filename =>
          <li key={filename}><button className='btn btn-link' onClick={() => downloadFile(filename)}>{filename}</button></li>
        )}
      </ul>
    </div>
  )
}
