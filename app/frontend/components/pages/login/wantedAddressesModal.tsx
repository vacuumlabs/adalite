import {h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'

const WantedAddressesModal = () => {
  const {closeWantedAddressModal} = useActions(actions)

  return (
    <Modal onRequestClose={closeWantedAddressModal} title={'Direct message - Action required'}>
      <p className="wanted-text">
        You are delegating to our pool NUFI0 and we are very happy that you chose to stake with us.
        However, your substantial stake is saturating the pool to 500%. By doing so, you are missing
        out on around 75% of your staking rewards.
      </p>
      <p className="wanted-text">
        Don't worry, for such cases, we have setup a dedicated staking infrastructure. To optimize
        your staking profits, we pre-filled more suitable pools specifically for your addresses, you
        just have to delegate the stake again from all affected accounts in the "Staking" tab.
      </p>
      <p className="wanted-text">
        We are happy to provide any support just for you respecting your anonymity and privacy.
        Please, contact us at <a href={'mailto:info@adalite.io'}>info@adalite.io</a>
        {', '}
        <a href={'mailto:michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a> or +421 907
        189 842 to avoid such troubles in the future.
      </p>
      <div className="modal-footer">{}</div>
    </Modal>
  )
}

export default WantedAddressesModal
