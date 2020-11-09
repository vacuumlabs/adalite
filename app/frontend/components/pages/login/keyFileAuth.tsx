import {h} from 'preact'
import {useState, useEffect, useRef} from 'preact/hooks'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import debugLog from '../../../helpers/debugLog'
import tooltip from '../../common/tooltip'
import FileLoader from '../../common/fileLoader'

import * as KeypassJson from '../../../wallet/keypass-json'
import {CRYPTO_PROVIDER_TYPES} from '../../../wallet/constants'

interface Props {
  loadingAction: any
  loadWallet: any
  stopLoadingAction: any
}

const LoadKeyFile = ({loadingAction, loadWallet, stopLoadingAction}: Props) => {
  const [fileName, setFileName] = useState<string>('')
  const [keyFile, setKeyFile] = useState<any>(undefined)
  const [encrypted, setEncrypted] = useState<boolean>(false)
  const [keyfileError, setKeyfileError] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string | undefined>('')
  const filePasswordField = useRef(null)

  useEffect(() => {
    const closePasswordModal = (e) => {
      if (e.key === 'Escape') {
        setEncrypted(false)
        setPasswordError(undefined)
      }
    }
    document.addEventListener('keydown', closePasswordModal, false)

    return function cleanup() {
      document.removeEventListener('keydown', closePasswordModal, false)
    }
  }, [])

  useEffect(
    () => {
      encrypted && filePasswordField.current.focus()
    },
    [encrypted]
  )

  const onPasswordInput = (e) => {
    setPassword(e.target.value)
    setPasswordError(undefined)
  }

  const unlockKeyfile = async () => {
    loadingAction('Unlocking key file')
    try {
      const walletSecretDef = await KeypassJson.importWalletSecretDef(keyFile, password)
      setPasswordError(undefined)
      loadWallet({
        cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
        walletSecretDef,
        shouldExportPubKeyBulk: true,
      })
    } catch (e) {
      stopLoadingAction()
      setPasswordError('Password for provided key file is incorrect.')
    }
  }

  const readFile = async (targetFile) => {
    setFileName(targetFile.name)
    setKeyFile(undefined)
    setKeyfileError(undefined)
    setPasswordError(undefined)

    const reader = new FileReader()
    await reader.readAsText(targetFile)

    reader.onload = ((theFile) => {
      return async (e) => {
        try {
          const walletExport = await JSON.parse(e.target.result)
          const isWalletExportEncrypted = await KeypassJson.isWalletExportEncrypted(walletExport)
          if (isWalletExportEncrypted) {
            setKeyFile(walletExport)
            stopLoadingAction()
            setEncrypted(true)
            setPassword('')
          } else {
            loadingAction('Reading key file')
            const walletSecretDef = await KeypassJson.importWalletSecretDef(walletExport, '')

            loadWallet({
              cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
              walletSecretDef,
              shouldExportPubKeyBulk: true,
            })
            setKeyfileError(undefined)
          }
        } catch (err) {
          debugLog(`Key file parsing failure: ${err}`)
          stopLoadingAction()
          setKeyfileError(
            'Provided file is incorrect. To access your wallet, continue by selecting a valid JSON key file.'
          )
        }
        return true
      }
    })(targetFile)
  }

  const error = keyfileError || passwordError
  return (
    <div className="authentication-content key-file">
      <FileLoader
        fileName={fileName}
        readFile={readFile}
        fileDescription="key"
        acceptedFiles="application/json,.json"
        error
      />
      <input
        type="password"
        className="input fullwidth auth"
        id="keyfile-password"
        name="keyfile-password"
        placeholder="Enter the password"
        value={password}
        onInput={onPasswordInput}
        ref={filePasswordField}
        onKeyDown={(e) => e.key === 'Enter' && unlockKeyfile()}
        autoComplete="off"
      />
      <div className="validation-row">
        <button
          disabled={!(password && fileName !== '') || !!error}
          onClick={unlockKeyfile}
          className="button primary"
          {...tooltip(
            'Please fill in the password for the\nselected key file before proceeding.',
            !password && fileName !== ''
          )}
          onKeyDown={(e) => {
            e.key === 'Enter' && (e.target as HTMLButtonElement).click()
            if (e.key === 'Tab') {
              filePasswordField.current.focus(e)
              e.preventDefault()
            }
          }}
        >
          Unlock
        </button>
        {error && <div className="validation-message error">{error}</div>}
      </div>
    </div>
  )
}

export default connect(
  undefined,
  actions
)(LoadKeyFile)
