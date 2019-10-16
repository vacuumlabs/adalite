const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {AdaIcon} = require('../../common/svg')
const {toAda} = require('../../../helpers/adaConverters')

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

module.exports = connect(
  (state) => ({
    donationAmount: state.donationAmount,
    maxDonationAmount: state.maxDonationAmount,
  }),
  actions
)(CustomInputButton)
