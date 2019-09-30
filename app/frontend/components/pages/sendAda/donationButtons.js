const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {AdaIcon} = require('../../common/svg')

const DonationButtons = ({
  updateDonation,
  checkedDonationType,
  sendAmount,
  sendAmountValidationError,
  toggleCustomDonation,
  isSendAddressValid,
  percentageDonationValue,
  percentageDonationText,
  thresholdAmountReached,
}) => {
  const isFormValid = isSendAddressValid && sendAmount && !sendAmountValidationError

  return h(
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
        'disabled': !isFormValid,
        'aria-label': 'Fixed amount',
      },
      h(AdaIcon),
      '40' //TODO: config this)
    ),
    h(
      'button',
      {
        'id': 'percentage',
        'class': checkedDonationType === 'percentage' ? 'button donate active' : 'button donate',
        'value': percentageDonationValue,
        'onClick': updateDonation,
        'disabled': !isFormValid || !thresholdAmountReached,
        'aria-label': 'Percentage amount',
      },
      `${percentageDonationText} (`,
      h(AdaIcon),
      `${percentageDonationValue})`
    ),
    h(
      'button',
      {
        class: 'button donate',
        id: 'custom',
        onClick: toggleCustomDonation,
        disabled: !isFormValid,
      },
      'Custom'
    )
  )
}

module.exports = connect(
  (state) => ({
    sendAmount: state.sendAmount.fieldValue,
    sendAmountValidationError: state.sendAmount.validationError,
    checkedDonationType: state.checkedDonationType,
    percentageDonationValue: state.percentageDonationValue,
    percentageDonationText: state.percentageDonationText,
    thresholdAmountReached: state.thresholdAmountReached,
  }),
  actions
)(DonationButtons)
