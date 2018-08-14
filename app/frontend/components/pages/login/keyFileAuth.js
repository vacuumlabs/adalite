const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const debugLog = require('../../../helpers/debugLog')
const CloseIcon = require('../../common/svg').CloseIcon

class LoadKeyFileClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileName: ' ',
      keyFile: undefined,
    }
    this.selectFile = this.selectFile.bind(this)
    this.readFile = this.readFile.bind(this)
    this.dragOver = this.dragOver.bind(this)
    this.drop = this.drop.bind(this)
    this.unlockKeyfile = this.unlockKeyfile.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.closePasswordModal = this.closePasswordModal.bind(this)
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
      const secret = await import(/* webpackPrefetch: true */ '../../../wallet/keypass-json').then(
        async (KeypassJson) =>
          (await KeypassJson.importWalletSecret(this.state.keyFile, this.state.password)).toString(
            'hex'
          )
      )

      this.setState({error: undefined})
      this.props.loadWallet({cryptoProvider: 'mnemonic', secret})
    } catch (e) {
      this.props.stopLoadingAction()
      this.setState({error: 'Wrong password'})
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
          const isWalletExportEncrypted = await import(/* webpackPrefetch: true */ '../../../wallet/keypass-json').then(
            async (KeypassJson) => await KeypassJson.isWalletExportEncrypted(walletExport)
          )

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
            const secret = await import(/* webpackPrefetch: true */ '../../../wallet/keypass-json').then(
              async (KeypassJson) =>
                (await KeypassJson.importWalletSecret(walletExport, '')).toString('hex')
            )

            this.props.loadWallet({cryptoProvider: 'mnemonic', secret})
            this.setState({error: undefined})
          }
        } catch (err) {
          debugLog(`Key file parsing failure: ${err}`)
          this.props.stopLoadingAction()
          this.setState({
            error: 'Key File parsing failure!',
          })
        }
        return true
      }
    })(file)
  }

  render({loadingAction}, {fileName, error, encrypted, password}) {
    return h(
      'div',
      {class: 'auth-section'},
      h(
        'div',
        undefined,
        h(
          'div',
          {class: 'load-file-row'},
          h(
            'div',
            {
              class: 'drop-area',
              onDragOver: this.dragOver,
              onDrop: this.drop,
            },
            h('b', {class: 'centered-row margin-1rem'}, 'Drop a key file here'),
            h('div', {class: 'centered-row'}, fileName),
            h(
              'div',
              {class: 'centered-row margin-top'},
              h(
                'div',
                undefined,
                h('input', {
                  class: 'display-none',
                  type: 'file',
                  id: 'loadFile',
                  accept: 'application/json,.json',
                  multiple: false,
                  onChange: this.selectFile,
                }),
                h(
                  'label',
                  {class: 'button-like', for: 'loadFile'},
                  h('div', undefined, 'Select key File')
                )
              )
            )
          )
        ),
        encrypted &&
          h(
            'div',
            {
              class: 'overlay fade-in-up',
              onKeyDown: (e) => {
                e.key === 'Escape' && this.closePasswordModal()
              },
            },
            h('div', {
              class: 'overlay-close-layer',
              onClick: this.closePasswordModal,
            }),
            h(
              'div',
              {class: 'box box-auto'},
              h(
                'span',
                {
                  class: 'overlay-close-button',
                  onClick: this.closePasswordModal,
                },
                h(CloseIcon)
              ),
              h(
                'div',
                {class: 'margin-1rem'},
                h('h4', undefined, 'Enter password:'),
                h(
                  'div',
                  {class: 'intro-input-row margin-top'},
                  h('input', {
                    type: 'password',
                    class: 'styled-input-nodiv styled-unlock-input',
                    id: 'keyfile-password',
                    name: 'keyfile-password',
                    placeholder: 'Enter key file password',
                    value: password,
                    onInput: this.updatePassword,
                    ref: (element) => {
                      this.filePasswordField = element
                    },
                    onKeyDown: (e) => e.key === 'Enter' && this.unlockKeyfile(),
                    autocomplete: 'nope',
                  }),
                  h(
                    'button',
                    {
                      disabled: !password,
                      onClick: this.unlockKeyfile,
                      onKeyDown: (e) => {
                        e.key === 'Enter' && e.target.click()
                        if (e.key === 'Tab') {
                          this.filePasswordField.focus(e)
                          e.preventDefault()
                        }
                      },
                    },
                    'Unlock'
                  )
                ),
                error && h('div', {class: 'alert error key-file-error'}, error)
              )
            )
          ),
        error && h('div', {class: 'alert error key-file-error'}, error)
      )
    )
  }
}

module.exports = connect(
  undefined,
  actions
)(LoadKeyFileClass)
