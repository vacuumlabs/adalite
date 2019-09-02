const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const DonationButtons = ({
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
      class: 'send-donate',
    },
    h(
      'button',
      {
        'id': 'fixed',
        'class': checkedDonationType === 'fixed' ? 'button donate active' : 'button donate',
        'value': 40, //TODO: config this
        'onClick': updateDonation,
        'disabled': !isSendAddressValid || !sendAmount,
        'aria-label': 'Fixed amount',
      },
      h('span', {class: 'ada-icon-before'}, '40') //TODO: config this)
    ),
    h(
      'button',
      {
        'id': 'percentage',
        'class': checkedDonationType === 'percentage' ? 'button donate active' : 'button donate',
        'value': percentageDonationValue,
        'onClick': updateDonation,
        'disabled': !isSendAddressValid || !sendAmount || !thresholdAmountReached,
        'aria-label': 'Percentage amount',
      },
      `${percentageDonationText} (`,
      h('span', {class: 'ada-icon-before'}, `${percentageDonationValue})`)
    ),
    h(
      'button',
      {
        class: 'button donate',
        id: 'custom',
        onClick: toggleCustomDonation,
        disabled: !isSendAddressValid || !sendAmount,
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
)(DonationButtons)
