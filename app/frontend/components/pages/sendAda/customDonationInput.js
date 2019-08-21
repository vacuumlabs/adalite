const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const CustomDonationInput = ({
  donationAmount,
  updateCustomDonation,
  sendMaxDonation,
  isSendAddressValid,
}) =>
  h(
    'div',
    {class: 'input-wrapper'},
    h('input', {
      class: 'input send-amount',
      id: 'donation-amount',
      name: 'donation-amount',
      placeholder: '0.000000',
      value: donationAmount,
      onInput: updateCustomDonation,
    }),
    h(
      'button',
      {
        class: 'button send-max',
        onClick: sendMaxDonation,
        disabled: !isSendAddressValid,
      },
      'Max'
    )
  )

module.exports = connect(
  (state) => ({
    donationAmount: state.donationAmount.fieldValue,
  }),
  actions
)(CustomDonationInput)
