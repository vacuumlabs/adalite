const assert = require('assert')
const {
  importWalletSecret,
  exportWalletSecret,
  isWalletExportEncrypted,
} = require('../../frontend/wallet/keypass-json')

const walletSecretObj1 = {
  wallet: {
    accounts: [{name: 'Initial account', index: 2147483648}],
    walletSecretKey:
      'WIBBInI3vP2jx7khIl5diD63/b0Uk16+iX9ZUXaaC8c1vfo7VINX4Z8n1ZBTv6IvQV+PXVW/4DG/4pRqRyXzzfo8qylAvT3d+8VaxCwdQF+Zf7pwS0XHF7J5iYnG6mGBSpSE6fJkOorcl4uKkSKUcquALRm3UlJRUnYqHOnBvKCDBQ==',
    walletMeta: {name: 'json2', assurance: 'normal', unit: 'ADA'},
    passwordHash:
      'WGQxNHw4fDF8V0NDL05oaUQ1VXZUTlN3ZjBxWUlmMDdCNDdpdjY2S1FzU1RFYzY4dGJTdkRvdz09fHhQdFdtN1JUSzJtUUdTSzd1TEU2N29mTGhoakhPZ3pyNFF1NVZBUnlwVXM9',
  },
  fileType: 'WALLETS_EXPORT',
  fileVersion: '1.0.0',
}
const walletPassword1 = 'WalletS3cret'
const walletSecretUnencrypted1 = Buffer.from(
  '80a93f1b0c558631f9473c0169dda414535caefa1a9b4a7a29b41f0d96b4aa4359eafca30ae2726745155a8034c671786984d65b9ac11f850447e3884267801cab2940bd3dddfbc55ac42c1d405f997fba704b45c717b2798989c6ea61814a9484e9f2643a8adc978b8a91229472ab802d19b752525152762a1ce9c1bca08305',
  'hex'
)

const walletSecretObj2 = {
  wallet: {
    accounts: [{name: 'Initial account', index: 2147483648}],
    walletSecretKey:
      'WIBA33Z+pQQkB34B9+yA3Lvh+53o7CjO4/VhNcrYFH8QV4//RxlP95Nhi4Sgx6m+Sb7FcHKy3JM8HcYN1D+QKNZGztjRssASP4dwiw9dt6s3d9LHJ9bcPYUnV/X7XCCJmEMCEK4tBxD+UiUip0ZWkVlXI4ICY6DnL/QhNB98q34Uwg==',
    walletMeta: {name: 'json1', assurance: 'normal', unit: 'ADA'},
    passwordHash:
      'WGQxNHw4fDF8V0NBbzBaazF4a2xwSXQ3S1d0RXp5cmU1MzJzQmdGWlE4NGlXMEZYVXcva3N3UT09fHh3blZGcmExd0taa3hXZ0gxOC92Ym1UNEtkaXZtNStsUkJ3VkJIK2J1dTA9',
  },
  fileType: 'WALLETS_EXPORT',
  fileVersion: '1.0.0',
}
const walletPassword2 = ''
const walletSecretUnencrypted2 = Buffer.from(
  '40df767ea50424077e01f7ec80dcbbe1fb9de8ec28cee3f56135cad8147f10578fff47194ff793618b84a0c7a9be49bec57072b2dc933c1dc60dd43f9028d646ced8d1b2c0123f87708b0f5db7ab3777d2c727d6dc3d852757f5fb5c208998430210ae2d0710fe522522a7465691595723820263a0e72ff421341f7cab7e14c2',
  'hex'
)

describe('Wallet import', () => {
  it('should properly import wallet encrypted with nonempty password', async () => {
    const walletSecret = await importWalletSecret(walletSecretObj1, walletPassword1)
    assert(walletSecret.equals(walletSecretUnencrypted1))
  })

  it('should properly import wallet encrypted with empty password', async () => {
    const walletSecret = await importWalletSecret(walletSecretObj2, walletPassword2)
    assert(walletSecret.equals(walletSecretUnencrypted2))
  }).timeout(5000)
})

describe('Wallet export', () => {
  it('should properly export wallet encrypted with nonempty password', async () => {
    const walletSecretObj = await exportWalletSecret(
      walletSecretUnencrypted1,
      walletPassword1,
      'json1'
    )
    const walletSecret = await importWalletSecret(walletSecretObj, walletPassword1)

    assert(walletSecret.equals(walletSecretUnencrypted1))
  }).timeout(5000)

  it('should properly export wallet encrypted with nonempty password', async () => {
    const walletSecretObj = await exportWalletSecret(
      walletSecretUnencrypted2,
      walletPassword2,
      'json2'
    )
    const walletSecret = await importWalletSecret(walletSecretObj, walletPassword2)

    assert(walletSecret.equals(walletSecretUnencrypted2))
  }).timeout(5000)
})

describe('Check whether wallet export is encrypted', () => {
  it('should properly verify encrypted export', async () => {
    assert((await isWalletExportEncrypted(walletSecretObj1)) === true)
  }).timeout(5000)

  it('should properly verify unencrypted export', async () => {
    assert((await isWalletExportEncrypted(walletSecretObj2)) === false)
  }).timeout(5000)
})
