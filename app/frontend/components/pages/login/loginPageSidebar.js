const {h, Component} = require('preact')
const connect = require('unistore/preact').connect

const Alert = require('../../common/alert')

const initialContent = () =>
  h(
    'div',
    {class: 'sidebar-content'},
    h(
      'div',
      {class: 'sidebar-item spacy'},
      h(
        Alert,
        {alertType: 'info sidebar'},
        h(
          'p',
          undefined,
          'AdaLite supports three means of accessing your wallet. For enhanced security, we recommend you to use a ',
          h('strong', undefined, 'hardware wallet.')
        ),
        h(
          'a',
          {
            class: 'sidebar-link',
            href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets',
            rel: 'noopener',
            target: 'blank',
          },
          'What is a Hardware Wallet'
        )
      )
    )
  )

const mnemonicContent = () =>
  h(
    'div',
    {class: 'sidebar-content'},
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        Alert,
        {alertType: 'info sidebar'},
        h('strong', undefined, 'What is a mnemonic?'),
        h(
          'p',
          undefined,
          'It’s a passphrase which serves as a seed to restore the addresses and their respective public and private keys associated with your wallet.'
        )
      )
    ),
    h(
      'div',
      {class: 'sidebar-item spacy'},
      h(
        Alert,
        {alertType: 'info sidebar'},
        h(
          'p',
          undefined,
          'AdaLite is fully interoperable with ',
          h(
            'a',
            {
              class: 'sidebar-link',
              href: 'https://yoroi-wallet.com/',
              rel: 'noopener',
              target: 'blank',
            },
            'Yoroi'
          ),
          ' mnemonics (15 words) and ',
          h(
            'a',
            {
              class: 'sidebar-link',
              href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#daedalus-compatibility',
              rel: 'noopener',
              target: 'blank',
            },
            'partially'
          ),
          ' interoperable with ',
          h(
            'a',
            {
              class: 'sidebar-link',
              href: 'https://daedaluswallet.io/',
              rel: 'noopener',
              target: 'blank',
            },
            'Daedalus'
          ),
          ' mnemonics (12/27 words).'
        )
      )
    ),
    h(
      Alert,
      {alertType: 'warning sidebar'},
      h(
        'p',
        undefined,
        'Mnemonic is not the most secure access method. For enhanced security, we strongly recommend you to use a ',
        h(
          'a',
          {
            class: 'sidebar-link',
            href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets',
            rel: 'noopener',
            target: 'blank',
          },
          'hardware wallet.'
        )
      )
    )
  )
const walletContent = () =>
  h(
    'div',
    {class: 'sidebar-content'},
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        Alert,
        {alertType: 'success sidebar'},
        h(
          'p',
          undefined,
          h('strong', undefined, 'Hardware wallets'),
          ' provide the best security for your private key since it never leaves the device when signing transactions.'
        )
      )
    ),
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        'p',
        {class: 'sidebar-paragraph'},
        'Computers might be vulnerable to attacks on program and system level. Typing your mnemonic directly may put your wallet at risk. We currently support Trezor Model T and Ledger Nano S and Nano X hardware wallets.'
      )
    ),
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        'a',
        {
          class: 'sidebar-link',
          href: 'https://wiki.trezor.io/Cardano_(ADA)',
          rel: 'noopener',
          target: 'blank',
        },
        'How to use Trezor T with AdaLite'
      )
    ),
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        'a',
        {
          class: 'sidebar-link',
          href: 'https://github.com/vacuumlabs/adalite/wiki/How-to-use-Ledger-Nano-S-with-AdaLite',
          rel: 'noopener',
          target: 'blank',
        },
        'How to use Ledger Nano S/X with AdaLite'
      )
    ),
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        'a',
        {
          class: 'sidebar-link',
          href: 'https://github.com/vacuumlabs/adalite/wiki/Troubleshooting',
          rel: 'noopener',
          target: 'blank',
        },
        'Troubleshooting'
      )
    )
  )
const fileContent = () =>
  h(
    'div',
    {class: 'sidebar-content'},
    h(
      'div',
      {class: 'sidebar-item spacy'},
      h(
        Alert,
        {alertType: 'info sidebar'},
        h('strong', undefined, 'What is a key file?'),
        h(
          'p',
          undefined,
          'It’s an encrypted JSON file you can export and load later instead of typing the whole mnemonic passphrase to access your wallet.'
        )
      )
    ),
    h(
      Alert,
      {alertType: 'warning sidebar'},
      h(
        'p',
        undefined,
        'The encrypted key file is not the most secure access method. For enhanced security, we strongly recommend you to use a ',
        h(
          'a',
          {
            class: 'sidebar-link',
            href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets',
            rel: 'noopener',
            target: 'blank',
          },
          'hardware wallet.'
        )
      )
    )
  )

class LoginPageSidebar extends Component {
  render({authMethod}) {
    return h(
      'aside',
      {class: 'sidebar'},
      authMethod === '' && h(initialContent),
      authMethod === 'mnemonic' && h(mnemonicContent),
      authMethod === 'hw-wallet' && h(walletContent),
      authMethod === 'file' && h(fileContent)
    )
  }
}

module.exports = connect((state) => ({
  authMethod: state.authMethod,
}))(LoginPageSidebar)
