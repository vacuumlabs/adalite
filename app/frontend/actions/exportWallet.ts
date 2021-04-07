import {Store} from '../state'
import {getWallet} from './wallet'
import {saveAs} from '../libs/file-saver'
import {exportWalletSecretDef} from '../wallet/keypass-json'

export default (store: Store) => {
  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await exportWalletSecretDef(getWallet().getWalletSecretDef(), password, walletName)
    )

    const blob = new Blob([walletExport], {
      type: 'application/json;charset=utf-8',
    })
    saveAs(blob, `${walletName}.json`)
  }

  return {
    exportJsonWallet,
  }
}
