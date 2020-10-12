import {h} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'

interface Props {
  fileName: string
  readFile: (targetFile: any) => void
  fileDescription: string
  acceptedFiles: string
  error: any
  loadingAction: any
  stopLoadingAction: any
}

const FileLoader = ({
  fileName,
  readFile,
  fileDescription,
  acceptedFiles,
  error,
  loadingAction,
  stopLoadingAction,
}: Props) => {
  const NoFileContent = () => (
    <div className="dropzone-content">
      <p className="dropzone-paragraph">Drop a {fileDescription} file here</p>
      <label className="button primary small" htmlFor="loadFile">
        Select a {fileDescription} file
      </label>
    </div>
  )

  const SelectedFileContent = () => (
    <div className="dropzone-content has-file">
      <div className="dropzone-filename">{fileName}</div>
      <label className="dropzone-link" htmlFor="loadFile">
        Select a different {fileDescription} file
      </label>
    </div>
  )

  const selectFile = (e) => {
    loadingAction('Reading file')
    const file = e.target.files[0]
    e.target.value = null
    readFile(file)
  }

  const drop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    loadingAction('Reading file')
    const file = e.dataTransfer.files[0]
    readFile(file)
  }

  const dragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  return (
    <div className={`dropzone ${error ? 'error' : ''}`} onDragOver={dragOver} onDrop={drop}>
      <input
        className="dropzone-file-input"
        type="file"
        id="loadFile"
        accept={acceptedFiles}
        multiple={false}
        onChange={selectFile}
      />
      {fileName === '' ? <NoFileContent /> : <SelectedFileContent />}
    </div>
  )
}

export default connect(
  (state) => ({
    sendSentry: state.sendSentry,
  }),
  actions
)(FileLoader)
