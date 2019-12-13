import {h} from 'preact'

const ExportCard = () => (
  <div className="export card">
    <div className="export-head">
      <h2 className="card-title export-title">Export your wallet key file</h2>
      <div className="export-type">JSON file</div>
    </div>
    <p className="export-paragraph">
      Key file can be used to access your wallet instead typing your mnemonic. It is encrypted by
      the password you choose.
    </p>
    <button
      className="button primary outline fullwidth"
      onClick={() => window.history.pushState({}, 'exportWallet', 'exportWallet')}
    >
      Export key file
    </button>
  </div>
)

export default ExportCard
