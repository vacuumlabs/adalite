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
        Dear owner(s) of this address:{' '}
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
        We greatly appreciate that you chose to stake with us. However, you are saturating the pool
        ADLT3 by delegating more than allowed 62 million ADA to it. By doing so, you are missing out
        on a lot of rewards.
      </p>
      <p className="wanted-text">
        We have setup a dedicated staking infrastructure with the same conditions as your current
        pool but it will be dedicated just for you. Please redelegate to the pre-filled Private
        Adalite pool in the Staking tab. Feel free to contact us at{' '}
        <a href={'mailto:adalite@vacuumlabs.com'}>adalite@vacuumlabs.com</a>
        {', '}
        <a href={'mailto:michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a> or +421 907
        189 842 to avoid saturation in the future.
      </p>
      <div className="modal-footer">{}</div>
    </Modal>
  )
}

export default WantedAddressesModal
