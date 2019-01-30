const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const debugLog = require('../../../helpers/debugLog')
const tooltip = require('../../common/tooltip')

const KeypassJson = require('../../../wallet/keypass-json')

class LoadKeyFileClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileName: '',
      keyFile: undefined,
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
    this.setState({encrypted: undefined, error: undefined})
  }

  updatePassword(e) {
    this.setState({password: e.target.value})
  }

  async unlockKeyfile() {
    this.props.loadingAction('Unlocking key file')

    try {
      const secret = (await KeypassJson.importWalletSecret(
        this.state.keyFile,
        this.state.password
      )).toString('hex')

      this.setState({error: undefined})
      this.props.loadWallet({cryptoProvider: 'mnemonic', secret})
    } catch (e) {
      this.props.stopLoadingAction()
      this.setState({error: 'Password for provided key file is incorrect.'})
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
      error: undefined,
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
            const secret = (await KeypassJson.importWalletSecret(walletExport, '')).toString('hex')

            this.props.loadWallet({cryptoProvider: 'mnemonic', secret})
            this.setState({error: undefined})
          }
        } catch (err) {
          debugLog(`Key file parsing failure: ${err}`)
          this.props.stopLoadingAction()
          this.setState({
            error:
              'Provided file is incorrect. To access your wallet, continue by selecting a valid JSON key file.',
          })
        }
        return true
      }
    })(file)
  }

  render({loadingAction}, {fileName, error, encrypted, password}) {
    const noFileContent = () =>
      h(
        'div',
        {class: 'dropzone-content'},
        h('p', {class: 'dropzone-paragraph'}, 'Drop a key file here'),
        h(
          'label',
          {
            class: 'button primary small',
            for: 'loadFile',
          },
          'Select a key file'
        )
      )

    const selectedFileContent = () =>
      h(
        'div',
        {class: 'dropzone-content has-file'},
        h('div', {class: 'dropzone-filename'}, fileName),
        h(
          'label',
          {
            class: 'dropzone-link',
            for: 'loadFile',
          },
          'Select a different key file'
        )
      )

    return h(
      'div',
      {class: 'authentication-content key-file'},
      h(
        'div',
        {
          class: `dropzone ${error ? 'error' : ''}`,
          onDragOver: this.dragOver,
          onDrop: this.drop,
        },
        h('input', {
          class: 'dropzone-file-input',
          type: 'file',
          id: 'loadFile',
          accept: 'application/json,.json',
          multiple: false,
          onChange: this.selectFile,
        }),
        fileName === '' ? h(noFileContent) : h(selectedFileContent)
      ),
      h('input', {
        type: 'password',
        class: 'input fullwidth auth',
        id: 'keyfile-password',
        name: 'keyfile-password',
        placeholder: 'Enter the password',
        value: password,
        onInput: this.updatePassword,
        ref: (element) => {
          this.filePasswordField = element
        },
        onKeyDown: (e) => e.key === 'Enter' && this.unlockKeyfile(),
        autocomplete: 'off',
      }),
      h(
        'div',
        {class: 'validation-row'},
        h(
          'button',
          {
            disabled: !(password && fileName !== ''),
            onClick: this.unlockKeyfile,
            class: 'button primary',
            ...tooltip(
              'Please fill in the password for the\nselected key file before proceeding.',
              !password && fileName !== ''
            ),
            onKeyDown: (e) => {
              e.key === 'Enter' && e.target.click()
              if (e.key === 'Tab') {
                this.filePasswordField.focus(e)
                e.preventDefault()
              }
            },
          },
          'Unlock'
        ),
        error && h('div', {class: 'validation-message error'}, error)
      )
    )
  }
}

module.exports = connect(
  undefined,
  actions
)(LoadKeyFileClass)
