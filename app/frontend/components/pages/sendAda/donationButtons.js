const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const DonationButtons = ({
  updateDonation,
  checkedDonationType, //TODO: use or delete
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
        id: 'fixed',
        value: 40, //TODO: config this
        onClick: updateDonation,
        disabled: !isSendAddressValid || !sendAmount,
      },
      h('span', {class: 'ada-icon-before'}, '40') //TODO: config this)
    ),
    h(
      'button',
      {
        id: 'percentage',
        value: percentageDonationValue,
        onClick: updateDonation,
        disabled: !isSendAddressValid || !sendAmount || !thresholdAmountReached,
      },
      `${percentageDonationText} (`,
      h('span', {class: 'ada-icon-before'}, `${percentageDonationValue})`)
    ),
    h(
      'button',
      {
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
