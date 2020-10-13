import {h} from 'preact'
import {useState} from 'preact/hooks'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import FileLoader from '../../common/fileLoader'
import tooltip from '../../common/tooltip'
import debugLog from '../../../helpers/debugLog'
import * as poolCertUtils from '../../../helpers/poolCertificateUtils'

interface Props {
  loadingAction: any
  stopLoadingAction: any
}

const PoolOwnerCard = ({loadingAction, stopLoadingAction}: Props) => {
  const [fileName, setFileName] = useState<string>('')
  const [certFile, setCertFile] = useState<any>(undefined)
  const [certFileError, setCertFileError] = useState<string>('')

  const signCertificateFile = async () => {
    loadingAction('Signing certificate file')
    try {
      // TODO: sign
      console.log(certFile)
    } catch (e) {
      stopLoadingAction()
      setCertFileError('An error occured while signing certificate.')
    }
  }

  const readFile = async (targetFile) => {
    setFileName(targetFile.name)
    setCertFile(undefined)
    setCertFileError(undefined)

    const reader = new FileReader()
    await reader.readAsText(targetFile)

    reader.onload = ((theFile) => {
      return async (e) => {
        try {
          const parsedFile = await JSON.parse(e.target.result)
          const deserializedCert = poolCertUtils.deserializeCertificate(parsedFile)
          setCertFile(deserializedCert)
          stopLoadingAction()
          setCertFileError(undefined)
        } catch (err) {
          debugLog(`Certificate file parsing failure: ${err}`)
          stopLoadingAction()
          setCertFileError(
            'Provided file is incorrect. To continue, load a valid JSON certificate file.'
          )
        }
        return true
      }
    })(targetFile)
  }

  const error = certFileError
  return (
    <div className="card">
      <h2 className="card-title small-margin">
        Pool registration certificate transaction
        <a
          {...tooltip(
            'Pool owners using hardware wallets can sign pool registration transactions by supplying the transaction file which contains a valid stake pool registration certificate in cardano-cli format.',
            true
          )}
        >
          <span className="show-info">{''}</span>
        </a>
      </h2>
      <FileLoader
        fileName={fileName}
        readFile={readFile}
        fileDescription="transaction"
        acceptedFiles="*"
        error
      />

      <div className="validation-row">
        <button
          disabled={fileName === '' || !!error}
          onClick={signCertificateFile}
          className="button primary"
          {...tooltip(
            'Please insert a valid certificate\nJSON file before proceeding.',
            fileName === ''
          )}
          onKeyDown={(e) => {
            e.key === 'Enter' && (e.target as HTMLButtonElement).click()
          }}
        >
          Sign
        </button>
        {error && <div className="validation-message error">{error}</div>}
      </div>
    </div>
  )
}

export default connect(
  undefined,
  actions
)(PoolOwnerCard)
