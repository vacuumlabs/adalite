const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const CustomInputButton = ({
  isSendAddressValid,
  toggleCustomDonation,
  setDonation,
  donationAmount,
  maxDonationAmount,
}) => {
  const maxDonationAmountInAda = Math.floor(maxDonationAmount / 1000000)

  return donationAmount.coins > maxDonationAmount
    ? h(
      'button',
      {
        class: 'button send-max',
        onClick: setDonation,
        disabled: !isSendAddressValid,
        value: maxDonationAmountInAda,
      },
      `Max (${maxDonationAmountInAda})`
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

module.exports = connect(
  (state) => ({
    donationAmount: state.donationAmount,
    maxDonationAmount: state.maxDonationAmount,
  }),
  actions
)(CustomInputButton)
