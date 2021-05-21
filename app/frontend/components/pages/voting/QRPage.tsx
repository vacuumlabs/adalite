import {Fragment, h} from 'preact'
import {useState, useEffect} from 'preact/hooks'
import {encryptWithPassword} from '../../../helpers/catalyst'
import * as QRious from '../../../libs/qrious'
import Alert from '../../common/alert'
import VotingDialogBottom from './votingDialogBottom'
import styles from './voting.module.scss'

const QRPage = ({
  nextStep,
  previousStep,
  privateVotingKey,
  pin,
}: {
  nextStep: () => void
  previousStep: () => void
  privateVotingKey: string
  pin: string
}): h.JSX.Element => {
  const [encryptedKey, setEncryptedKey] = useState('')
  useEffect(() => {
    async function prepareQRKey() {
      const encrypted = await encryptWithPassword(
        Buffer.from(pin.split('').map(Number)),
        Buffer.from(privateVotingKey, 'hex')
      )
      setEncryptedKey(encrypted)
    }
    prepareQRKey()
  }, [pin, privateVotingKey])

  return (
    <Fragment>
      <Alert alertType="info">
        Scan this QR code using the Catalyst Voting Application and follow the instructions.
      </Alert>
      <Alert alertType="warning">
        You will not be able to access this code after closing this dialog. Take a screenshot or a
        photo of this QR code as a backup!
      </Alert>
      <div className={styles.votingQr} data-cy="VotingQRCode">
        <img
          src={new QRious({
            value: encryptedKey,
            level: 'M',
            size: 200,
          }).toDataURL()}
        />
      </div>
      <VotingDialogBottom nextStep={nextStep} previousStep={previousStep} nextButtonName="Finish" />
    </Fragment>
  )
}

export default QRPage
