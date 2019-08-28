const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const DonationRadioButtons = ({
  updateDonation,
  checkedDonationType,
  sendAmount,
  toggleCustomDonation,
  isSendAddressValid,
  percentageDonationValue,
  percentageDonationText,
  thresholdAmountReached,
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
      '40 A' //TODO: config this, ada symbol before
    ),
    h('input', {
      type: 'radio',
      id: 'percentage',
      name: 'radioDonate',
      value: percentageDonationValue,
      onClick: updateDonation,
      checked: checkedDonationType === 'percentage',
      disabled: !isSendAddressValid || !sendAmount || !thresholdAmountReached,
    }),
    h(
      'label',
      {
        for: 'percentage',
      },
      `${percentageDonationText} (${percentageDonationValue})`
    ),
    h('input', {
      type: 'radio',
      id: 'custom',
      name: 'radioDonate',
      value: 0,
      onClick: toggleCustomDonation,
      checked: checkedDonationType === 'custom',
      disabled: !isSendAddressValid || !sendAmount,
    }),
    h(
      'label',
      {
        for: 'custom',
      },
      'Custom'
    )
  )

module.exports = connect(
  (state) => ({
    sendAmount: state.sendAmount.fieldValue,
    checkedDonationType: state.checkedDonationType,
    percentageDonationValue: Math.round(state.percentageDonationValue),
    percentageDonationText: state.percentageDonationText,
    thresholdAmountReached: state.thresholdAmountReached,
  }),
  actions
)(DonationRadioButtons)
