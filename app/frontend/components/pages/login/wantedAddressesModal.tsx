import {Fragment, h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import {WANTED_DELEGATOR_ADDRESSES} from '../../../wallet/constants'
import Alert from '../../common/alert'

const WantedAddressesModal = () => {
  const {closeWantedAddressModal} = useActions(actions)

  return (
    <Modal onRequestClose={closeWantedAddressModal} title={'Direct message - Action required'}>
      <div>
        Dear owner(s) of these addresses:{' '}
        <Alert alertType="wanted">
          {WANTED_DELEGATOR_ADDRESSES.map((address, key) => (
            <Fragment key={key}>
              {address}
              <br />
            </Fragment>
          ))}
        </Alert>
      </div>
      <p className="wanted-text">
        You are delegating to our pool ADLT4 and we are very happy that you chose to stake with us.
        However, you are extremely saturating this pool to 500%. By doing so, you are missing out on
        around 50,000 USD per day and you are making other users in ADLT4 miss out on another 10,000
        USD per day.
      </p>
      <p className="wanted-text">
        Please, contact us at <a href={'mailto:adalite@vacuumlabs.com'}>adalite@vacuumlabs.com</a>
        {', '}
        <a href={'mailto:michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a> or +421 907
        189 842 and we will setup a dedicated staking infrastructure just for you free of charge and
        help you with setting up a more effective stake delegation scheme.
      </p>
      <div className="modal-footer">{}</div>
    </Modal>
  )
}

export default WantedAddressesModal
