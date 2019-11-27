import {h} from 'preact'

const ExportCard = () =>
  h(
    'div',
    {class: 'export card'},
    h(
      'div',
      {class: 'export-head'},
      h('h2', {class: 'card-title export-title'}, 'Export your wallet key file'),
      h('div', {class: 'export-type'}, 'JSON file')
    ),
    h(
      'p',
      {class: 'export-paragraph'},
      'Key file can be used to access your wallet instead typing your mnemonic. It is encrypted by the password you choose.'
    ),
    h(
      'button',
      {
        class: 'button primary outline fullwidth',
        onClick: () => window.history.pushState({}, 'exportWallet', 'exportWallet'),
      },
      'Export key file'
    )
  )

export default ExportCard
