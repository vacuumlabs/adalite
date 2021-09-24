import {h} from 'preact'
import {useSelector} from '../../../helpers/connect'
import {State} from '../../../state'
import {AuthMethodType} from '../../../types'
import assertUnreachable from '../../../helpers/assertUnreachable'

import Alert from '../../common/alert'

const InitialContent = () => (
  <div className="sidebar-content">
    <div className="sidebar-item spacy">
      <Alert alertType="info sidebar">
        <p>
          AdaLite supports three means of accessing your wallet. For enhanced security, we recommend
          you to use a <strong>hardware wallet.</strong>
        </p>
        <a
          className="sidebar-link"
          href="https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets"
          rel="noopener"
          target="blank"
        >
          What is a Hardware Wallet
        </a>
      </Alert>
    </div>
  </div>
)

const MnemonicContent = () => (
  <div className="sidebar-content">
    <div className="sidebar-item">
      <Alert alertType="info sidebar">
        <strong>What is a mnemonic?</strong>
        <p>
          It’s a passphrase which serves as a seed to restore the addresses and their respective
          public and private keys associated with your wallet.
        </p>
      </Alert>
    </div>
    <div className="sidebar-item spacy">
      <Alert alertType="info sidebar">
        <p>
          AdaLite is fully interoperable with{' '}
          <a
            className="sidebar-link"
            href="https://yoroi-wallet.com/"
            rel="noopener"
            target="blank"
          >
            Yoroi-type
          </a>{' '}
          mnemonics (15 words) and{' '}
          <a
            className="sidebar-link"
            href="https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#daedalus-compatibility"
            rel="noopener"
            target="blank"
          >
            partially
          </a>{' '}
          interoperable with{' '}
          <a
            className="sidebar-link"
            href="https://daedaluswallet.io/"
            rel="noopener"
            target="blank"
          >
            Daedalus-type
          </a>{' '}
          mnemonics (12, 24 or 27 words).
        </p>
      </Alert>
    </div>
    <Alert alertType="warning sidebar">
      <p>
        Mnemonic is not the most secure access method. For enhanced security, we strongly recommend
        you to use a{' '}
        <a
          className="sidebar-link"
          href="https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets"
          rel="noopener"
          target="blank"
        >
          hardware wallet.
        </a>
      </p>
    </Alert>
  </div>
)

const WalletContent = () => (
  <div className="sidebar-content">
    <div className="sidebar-item">
      <Alert alertType="success sidebar">
        <p>
          <strong>Hardware wallets</strong> provide the best security for your private key since it
          never leaves the device when signing transactions.
        </p>
      </Alert>
    </div>
    <div className="sidebar-item">
      <p className="sidebar-paragraph">
        Computers might be vulnerable to attacks on program and system level. Typing your mnemonic
        directly may put your wallet at risk. We currently support Trezor Model T, Ledger Nano S,
        Ledger Nano X and BitBox02 hardware wallets.
      </p>
    </div>
    <div className="sidebar-item">
      <a
        className="sidebar-link"
        href="https://wiki.trezor.io/Cardano_(ADA)"
        rel="noopener"
        target="blank"
      >
        How to use Trezor T with AdaLite
      </a>
    </div>
    <div className="sidebar-item">
      <a
        className="sidebar-link"
        href="https://github.com/vacuumlabs/adalite/wiki/Ledger-before-you-start"
        rel="noopener"
        target="blank"
      >
        How to use Ledger Nano S/X with AdaLite
      </a>
    </div>
    <div className="sidebar-item">
      <a
        className="sidebar-link"
        href="https://github.com/vacuumlabs/adalite/wiki/Troubleshooting"
        rel="noopener"
        target="blank"
      >
        Troubleshooting
      </a>
    </div>
  </div>
)

const FileContent = () => (
  <div className="sidebar-content">
    <div className="sidebar-item spacy">
      <Alert alertType="info sidebar">
        <strong>What is a key file?</strong>
        <p>
          It’s an encrypted JSON file you can export and load later instead of typing the whole
          mnemonic passphrase to access your wallet.
        </p>
      </Alert>
    </div>
    <Alert alertType="warning sidebar">
      <p>
        The encrypted key file is not the most secure access method. For enhanced security, we
        strongly recommend you to use a{' '}
        <a
          className="sidebar-link"
          href="https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#hardware-wallets"
          rel="noopener"
          target="blank"
        >
          hardware wallet.
        </a>
      </p>
    </Alert>
  </div>
)

const SidebarContentByAuthMethod = ({authMethod}: {authMethod: AuthMethodType}) => {
  switch (authMethod) {
    case null:
      return <InitialContent />
    case AuthMethodType.MNEMONIC:
      return <MnemonicContent />
    case AuthMethodType.HW_WALLET:
      return <WalletContent />
    case AuthMethodType.KEY_FILE:
      return <FileContent />
    default:
      return assertUnreachable(authMethod)
  }
}

const LoginPageSidebar = () => {
  const {authMethod} = useSelector((state: State) => ({authMethod: state.authMethod}))
  return (
    <aside className="sidebar">
      <SidebarContentByAuthMethod authMethod={authMethod} />
    </aside>
  )
}

export default LoginPageSidebar
