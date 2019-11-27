import {h} from 'preact'
import {connect} from 'unistore/preact'
import actions from '../../../actions'
import {AdaIcon} from '../../common/svg'
import {toAda} from '../../../helpers/adaConverters'

const CustomInputButton = ({
  isSendAddressValid,
  toggleCustomDonation,
  setDonation,
  donationAmount,
  maxDonationAmount,
}) => {
  const maxDonationAmountInAda = Math.floor(toAda(maxDonationAmount))

  return donationAmount.coins > maxDonationAmount
    ? h(
      'button',
      {
        class: 'button send-max',
        onClick: (e) => {
          e.preventDefault()
          setDonation(maxDonationAmountInAda)
        },
        disabled: !isSendAddressValid,
      },
      'Max (',
      `${maxDonationAmountInAda} `,
      h(AdaIcon),
      ')'
    )
    : h(
      'button',
      {
        class: 'button send-max',
        onClick: toggleCustomDonation,
      },
      'Back'
    )
}

export default connect(
  (state) => ({
    donationAmount: state.donationAmount,
    maxDonationAmount: state.maxDonationAmount,
  }),
  actions
)(CustomInputButton)
