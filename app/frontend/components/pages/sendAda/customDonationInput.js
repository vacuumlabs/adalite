const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const CustomInputButton = require('./customDonationButton')

const CustomDonationInput = ({
  donationAmount,
  updateDonation,
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
      value: donationAmount.fieldValue,
      onInput: updateDonation,
    }),
    h(CustomInputButton, {isSendAddressValid}),
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
    donationAmount: state.donationAmount,
  }),
  actions
)(CustomDonationInput)
