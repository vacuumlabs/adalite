import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import debugLog from '../../../helpers/debugLog'
import tooltip from '../../common/tooltip'

import * as KeypassJson from '../../../wallet/keypass-json'
import {CRYPTO_PROVIDER_TYPES} from '../../../wallet/constants'

interface Props {
  loadingAction: any
  loadWallet: any
  stopLoadingAction: any
}

interface State {
  fileName: string
  keyFile: any
  encrypted: boolean
  keyfileError: string
  password: string
  passwordError: string | undefined
}

class LoadKeyFileClass extends Component<Props, State> {
  filePasswordField: any

  constructor(props) {
    super(props)
    this.state = {
      fileName: '',
      password: '',
      keyFile: undefined,
      encrypted: undefined,
      keyfileError: '',
      passwordError: '',
    }
    this.selectFile = this.selectFile.bind(this)
    this.readFile = this.readFile.bind(this)
    this.dragOver = this.dragOver.bind(this)
    this.drop = this.drop.bind(this)
    this.unlockKeyfile = this.unlockKeyfile.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.closePasswordModal = this.closePasswordModal.bind(this)
    this.escClosePasswordModal = this.escClosePasswordModal.bind(this)
  }
  escClosePasswordModal(e) {
    e.key === 'Escape' && this.closePasswordModal()
  }
  componentDidMount() {
    document.addEventListener('keydown', this.escClosePasswordModal, false)
  }
  componentWillUnmount() {
    document.addEventListener('keydown', this.escClosePasswordModal, false)
  }

  componentDidUpdate() {
    this.state.encrypted && this.filePasswordField.focus()
  }

  closePasswordModal() {
    this.setState({encrypted: undefined, passwordError: undefined})
  }

  updatePassword(e) {
    this.setState({
      password: e.target.value,
      passwordError: undefined,
    })
  }

  async unlockKeyfile() {
    this.props.loadingAction('Unlocking key file')

    try {
      const walletSecretDef = await KeypassJson.importWalletSecretDef(
        this.state.keyFile,
        this.state.password
      )

      this.setState({passwordError: undefined})
      this.props.loadWallet({
        cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
        walletSecretDef,
        shouldExportPubKeyBulk: true,
      })
    } catch (e) {
      this.props.stopLoadingAction()
      this.setState({
        passwordError: 'Password for provided key file is incorrect.',
      })
    }
  }

  selectFile(e) {
    this.props.loadingAction('Reading file')
    const file = e.target.files[0]
    e.target.value = null
    this.readFile(file)
  }

  drop(e) {
    e.stopPropagation()
    e.preventDefault()
    this.props.loadingAction('Reading file')
    const file = e.dataTransfer.files[0]
    this.readFile(file)
  }

  dragOver(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  async readFile(file) {
    this.setState({
      fileName: file.name,
      keyFile: undefined,
      keyfileError: undefined,
      passwordError: undefined,
    })

    const reader = new FileReader()
    await reader.readAsText(file)

    reader.onload = ((theFile) => {
      return async (e) => {
        try {
          const walletExport = await JSON.parse(e.target.result)
          const isWalletExportEncrypted = await KeypassJson.isWalletExportEncrypted(walletExport)
          if (isWalletExportEncrypted) {
            this.setState({
              keyFile: walletExport,
            })
            this.props.stopLoadingAction()
            this.setState({
              encrypted: true,
              password: '',
            })
          } else {
            this.props.loadingAction('Reading key file')
            const walletSecretDef = await KeypassJson.importWalletSecretDef(walletExport, '')

            this.props.loadWallet({
              cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
              walletSecretDef,
              shouldExportPubKeyBulk: true,
            })
            this.setState({keyfileError: undefined})
          }
        } catch (err) {
          debugLog(`Key file parsing failure: ${err}`)
          this.props.stopLoadingAction()
          this.setState({
            keyfileError:
              'Provided file is incorrect. To access your wallet, continue by selecting a valid JSON key file.',
          })
        }
        return true
      }
    })(file)
  }

  render({loadingAction}, {fileName, keyfileError, passwordError, encrypted, password}) {
    const NoFileContent = () => (
      <div className="dropzone-content">
        <p className="dropzone-paragraph">Drop a key file here</p>
        <label className="button primary small" htmlFor="loadFile">
          Select a key file
        </label>
      </div>
    )

    const SelectedFileContent = () => (
      <div className="dropzone-content has-file">
        <div className="dropzone-filename">{fileName}</div>
        <label className="dropzone-link" htmlFor="loadFile">
          Select a different key file
        </label>
      </div>
    )

    const error = keyfileError || passwordError

    return (
      <div className="authentication-content key-file">
        <div
          className={`dropzone ${error ? 'error' : ''}`}
          onDragOver={this.dragOver}
          onDrop={this.drop}
        >
          <input
            className="dropzone-file-input"
            type="file"
            id="loadFile"
            accept="application/json,.json"
            multiple={false}
            onChange={this.selectFile}
          />
          {fileName === '' ? <NoFileContent /> : <SelectedFileContent />}
        </div>
        <input
          type="password"
          className="input fullwidth auth"
          id="keyfile-password"
          name="keyfile-password"
          placeholder="Enter the password"
          value={password}
          onInput={this.updatePassword}
          ref={(element) => {
            this.filePasswordField = element
          }}
          onKeyDown={(e) => e.key === 'Enter' && this.unlockKeyfile()}
          autoComplete="off"
        />
        <div className="validation-row">
          <button
            disabled={!(password && fileName !== '') || error}
            onClick={this.unlockKeyfile}
            className="button primary"
            {...tooltip(
              'Please fill in the password for the\nselected key file before proceeding.',
              !password && fileName !== ''
            )}
            onKeyDown={(e) => {
              e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              if (e.key === 'Tab') {
                this.filePasswordField.focus(e)
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
}

export default connect(
  undefined,
  actions
)(LoadKeyFileClass)
