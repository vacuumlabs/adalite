const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const CustomDonationInput = ({
  donationAmount,
  updateDonation,
  sendMaxDonation,
  isSendAddressValid,
  toggleCustomDonation,
}) =>
  h(
    'div',
    {class: 'input-wrapper'},
    h('input', {
      class: 'input send-amount',
      id: 'custom',
      name: 'donation-amount',
      placeholder: '0.000000',
      value: donationAmount,
      onInput: updateDonation,
    }),
    h(
      'button',
      {
        class: 'button send-max',
        onClick: sendMaxDonation,
        disabled: !isSendAddressValid,
      },
      'Max'
    ),
    h(
      'button',
      {
        // class: // TODO: back button
        onClick: toggleCustomDonation,
      },
      'Back' //TODO: change to just icon
    )
  )

module.exports = connect(
  (state) => ({
    donationAmount: state.donationAmount.fieldValue,
  }),
  actions
)(CustomDonationInput)
