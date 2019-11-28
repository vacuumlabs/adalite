const {h, Component} = require('preact')
const {getTranslation} = require('../../../translations')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const mnemonicToWalletSecretDef = require('../../../wallet/helpers/mnemonicToWalletSecretDef')
const {CRYPTO_PROVIDER_TYPES} = require('../../../wallet/constants')
const tooltip = require('../../common/tooltip')
const Alert = require('../../common/alert')
const sanitizeMnemonic = require('../../../helpers/sanitizeMnemonic')

class LoadByMenmonicSectionClass extends Component {
  componentDidUpdate() {
    const shouldFormFocus =
      !this.props.mnemonic && !this.props.displayWelcome && !this.props.showDemoWalletWarningDialog
    shouldFormFocus && this.mnemonicField.focus()
  }

  render({
    mnemonicInputValue,
    mnemonicValidationError,
    updateMnemonic,
    checkForMnemonicValidationError,
    loadWallet,
    showMnemonicValidationError,
    showMnemonicInfoAlert,
    openGenerateMnemonicDialog,
  }) {
    const sanitizedMnemonic = sanitizeMnemonic(mnemonicInputValue)

    return h(
      'div',
      {class: `authentication-content ${showMnemonicInfoAlert ? '' : 'centered'}`},
      showMnemonicInfoAlert &&
        h(
          Alert,
          {alertType: 'info auth'},
          'Here you can use your mnemonic to access your new wallet.'
        ),
      h('h2', {class: 'authentication-title'}, 'Incentivized-Testnet Balance Check'),
      h(
        'h4',
        {class: 'feature-explanation'},
        'In order to take part in staking, it is necessary to hold your ADA on Adalite mnemonic (alternatively Yoroi or Daedalus) at the time of a "snapshot". ADA held in exchanges or on hardware wallets will not be included in the snapshot. The main role of the snapshot is to track your address balance at a certain time, so that you can work with the same amount later in the testnet environment. You can immediately move the ADA back after the snapshot. First testing snapshot occured on 12th of November and the "Official Snapshot" will roll out in the near future. Balance Check feature is a verification for the users whether the snapshot worked for their address. You can find more information about Incentivized Testnet in the official IOHK article ',
        h(
          'a',
          {
            href:
              'https://iohk.io/en/blog/posts/2019/10/24/incentivized-testnet-what-is-it-and-how-to-get-involved/',
            target: 'blank',
          },
          'here.'
        ),
        ' Please refer to this ',
        h(
          'a',
          {
            href: 'https://staking.cardano.org/',
            target: 'blank',
          },
          'link'
        ),
        ' for additional information about shelley, delegating stake, running a stake pool and staying in touch.'
      ),
      h(
        'label',
        {
          class: 'authentication-label',
          for: 'mnemonic-submitted',
        },
        'Enter the 12 or 15-word wallet mnemonic or 27-word Daedalus-type paper wallet mnemonic'
      ),
      h('input', {
        type: 'text',
        class: 'input fullwidth auth',
        id: 'mnemonic-submitted',
        name: 'mnemonic-submitted',
        placeholder: 'Enter your wallet mnemonic',
        value: mnemonicInputValue,
        onInput: updateMnemonic,
        onBlur: checkForMnemonicValidationError,
        autocomplete: 'off',
        ref: (element) => {
          this.mnemonicField = element
        },
        onKeyDown: (e) => e.key === 'Enter' && this.goBtn.click(),
      }),
      h(
        'div',
        {class: 'validation-row'},
        h(
          'button',
          {
            class: 'button primary',
            disabled: !sanitizedMnemonic || mnemonicValidationError,
            onClick: async () =>
              loadWallet({
                cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
                walletSecretDef: await mnemonicToWalletSecretDef(sanitizedMnemonic),
              }),
            ...tooltip(
              'Your input appears to be incorrect.\nCheck for the typos and try again.',
              showMnemonicValidationError && sanitizedMnemonic && mnemonicValidationError
            ),
            onKeyDown: (e) => {
              e.key === 'Enter' && e.target.click()
              if (e.key === 'Tab') {
                this.mnemonicField.focus()
                e.preventDefault()
              }
            },
            ref: (element) => {
              this.goBtn = element
            },
          },
          'Check balance'
        ),
        mnemonicValidationError &&
          showMnemonicValidationError &&
          h(
            'div',
            {class: 'validation-message error'},
            getTranslation(mnemonicValidationError.code)
          )
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    mnemonicInputValue: state.mnemonicInputValue,
    displayWelcome: state.displayWelcome,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    mnemonicValidationError: state.mnemonicValidationError,
    showMnemonicValidationError: state.showMnemonicValidationError,
    showMnemonicInfoAlert: state.showMnemonicInfoAlert,
  }),
  actions
)(LoadByMenmonicSectionClass)
