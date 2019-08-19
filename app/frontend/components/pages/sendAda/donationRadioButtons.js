const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const DonationRadioButtons = ({
  updateDonation,
  checkedDonationType,
  sendAmount,
  setCustomDonation,
  isSendAddressValid,
  percentageValue,
}) =>
  h(
    'div',
    {
      class: 'radio-bar',
    },
    h('input', {
      type: 'radio',
      id: 'fixed',
      name: 'radioDonate',
      value: 40, //TODO: config this
      onClick: updateDonation,
      checked: checkedDonationType === 'fixed',
      disabled: !isSendAddressValid || !sendAmount,
    }),
    h(
      'label',
      {
        for: 'fixed',
      },
      '40 A' //TODO: config this
    ),
    h('input', {
      type: 'radio',
      id: 'percentage',
      name: 'radioDonate',
      value: percentageValue,
      onClick: updateDonation,
      checked: checkedDonationType === 'percentage',
      disabled: !isSendAddressValid || !sendAmount,
    }),
    h(
      'label',
      {
        for: 'percentage',
      },
      `0.2% (${percentageValue})`
    ),
    h('input', {
      type: 'radio',
      id: 'custom',
      name: 'radioDonate',
      value: 0,
      onClick: setCustomDonation,
      checked: checkedDonationType === 'custom',
      disabled: !isSendAddressValid || !sendAmount,
    }),
    h(
      'label',
      {
        for: 'custom',
        disabled: true,
      },
      'Custom'
    )
  )

module.exports = connect(
  (state) => ({
    sendAmount: state.sendAmount.fieldValue,
    checkedDonationType: state.checkedDonationType,
  }),
  actions
)(DonationRadioButtons)
