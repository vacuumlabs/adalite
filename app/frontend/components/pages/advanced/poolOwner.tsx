import {h} from 'preact'
import {useState} from 'preact/hooks'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import FileLoader from '../../common/fileLoader'
import tooltip from '../../common/tooltip'
import {getTranslation} from '../../../translations'

interface Props {
  loadingAction: any
  stopLoadingAction: any
  loadPoolCertificateTx: any
  poolRegTxError: any
}

const PoolOwnerCard = ({
  loadingAction,
  stopLoadingAction,
  loadPoolCertificateTx,
  poolRegTxError,
}: Props) => {
  const [fileName, setFileName] = useState<string>('')
  const [certFile, setCertFile] = useState<any>(undefined)

  const signCertificateFile = async () => {
    loadingAction('Signing certificate file')
    try {
      // TODO: sign
      console.log(certFile)
    } catch (e) {
      stopLoadingAction()
    }
  }

  const readFile = async (targetFile) => {
    setFileName(targetFile.name)
    setCertFile(undefined)

    const reader = new FileReader()
    await reader.readAsText(targetFile)

    reader.onload = ((theFile) => {
      return async (e) => await loadPoolCertificateTx(e.target.result)
    })(targetFile)
  }

  const error = poolRegTxError
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

      <div className="validation-row pool-owner">
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
        {error && (
          <div className="validation-message error">{getTranslation(error.code, error.params)}</div>
        )}
      </div>
    </div>
  )
}

export default connect(
  (state) => ({
    poolRegTxError: state.poolRegTxError,
  }),
  actions
)(PoolOwnerCard)
