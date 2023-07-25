import {h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'

const WantedAddressesModal = () => {
  const {closeWantedAddressModal} = useActions(actions)

  return (
    <Modal onRequestClose={closeWantedAddressModal} title={'Direct message - Action required'}>
      <p className="wanted-text">Dear user!</p>
      <p className="wanted-text">
        Your account with address{' '}
        <a
          href="https://cexplorer.io/stake/stake1u80xwh0jrxudvmvu8g8c4f8fyu6tue2nfpj52kc0z7rp90skxlz6a"
          target="_blank"
          rel="noopener"
        >
          stake1u80xwh0jrxudvmvu8g8c4f8fyu6tue2nfpj52kc0z7rp90skxlz6a
        </a>{' '}
        that you recently delegated to us contains 74 million ADA which is more than maximal
        possible stake pool saturation (which is 63 millions at the moment). This caused our
        recommendation algorithm to fail and you delegated to one of our most saturated pools.
      </p>
      <p className="wanted-text">
        We strongly recommend to divide your ADA into 2 accounts (with roughly 37 mil ADA each) and
        redelegate them both to our emptier pools, ideally manually by pasting the pool id - one to{' '}
        <a
          href="https://cexplorer.io/pool/pool15r7xg0vrrv2yu8wj3866eap8ftkuxvdk5rjz2lh4xajjq5v3p5d"
          target="_blank"
          rel="noopener"
        >
          {' '}
          Nu.Fi & AdaLite 0
        </a>{' '}
        and the other to{' '}
        <a
          href="https://cexplorer.io/pool/pool1ea568m9q882n0tx5d4vxff2dmz2n7rq5h62hx5ystq625m4tcfu"
          target="_blank"
          rel="noopener"
        >
          Nu.Fi & AdaLite 6
        </a>
        .
      </p>
      <p className="wanted-text">
        We really appreciate your support and we would like to offer you best possible service.
        Please reach out to <a href={'michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a>{' '}
        and receive priority staking support. This will help you achieve optimal staking returns.
      </p>
      <div className="modal-footer">{}</div>
    </Modal>
  )
}

export default WantedAddressesModal
