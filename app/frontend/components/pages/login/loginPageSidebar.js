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
        )
      )
    ),
    h(
      'div',
      {class: 'sidebar-item'},
      h(
        'a',
        {
          class: 'sidebar-link',
          href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets',
          rel: 'noopener',
        },
        'What is a Hardware Wallet'
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
        },
        'How to use Trezor T with AdaLite'
      )
    ),
    h(
      'p',
      {class: 'sidebar-paragraph'},
      'If you want to purchase Trezor, please consider supporting us by using our ',
      h(
        'a',
        {
          class: 'sidebar-link',
          href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071',
          rel: 'noopener',
        },
        'affiliate link.'
      )
    )
  )

const mnemonicContent = () =>
  h(
    'div',
    {class: 'sidebar-content'},
    h(
      'div',
      {class: 'sidebar-item spacy'},
      h(
        Alert,
        {alertType: 'info sidebar'},
        h('strong', undefined, 'What is a mnemonic?'),
        h(
          'p',
          undefined,
          'It’s a passphrase which serves as a seed to restore the addresses and their respective public and private keys associated with your wallet. We use the same derivation scheme as ',
          h(
            'a',
            {
              class: 'sidebar-link',
              href: 'https://daedaluswallet.io/',
              rel: 'noopener',
            },
            'Deadalus - the official Cardano wallet.'
          )
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
        'Computers might be vulnerable to attacks on program and system level. Typing your mnemonic directly might may put your wallet at risk. We currently support Trezor T hardware wallet.'
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
        },
        'How to use Trezor T with AdaLite'
      )
    ),
    h(
      'p',
      {class: 'sidebar-paragraph'},
      'If you want to purchase Trezor, please consider supporting us by using our ',
      h(
        'a',
        {
          class: 'sidebar-link',
          href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071',
          rel: 'noopener',
        },
        'affiliate link.'
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
      authMethod === 'trezor' && h(walletContent),
      authMethod === 'file' && h(fileContent)
    )
  }
}

module.exports = connect((state) => ({
  authMethod: state.authMethod,
}))(LoginPageSidebar)
