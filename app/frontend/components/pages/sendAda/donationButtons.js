const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {AdaIcon} = require('../../common/svg')

class DonationButtons extends Component {
  constructor(props) {
    super(props)
    this.getButtonClass = this.getButtonClass.bind(this)
    this.isInsufficient = this.isInsufficient.bind(this)
  }

  getButtonClass(donationAmount, type) {
    if (donationAmount * 1000000 > this.props.maxDonationAmount) {
      return 'button donate insufficient'
    }
    return this.props.checkedDonationType === type ? 'button donate active' : 'button donate'
  }

  isInsufficient(donationAmount, type) {
    if (donationAmount * 1000000 <= this.props.maxDonationAmount) {
      return false
    }
    if (this.props.checkedDonationType === type) {
      this.props.resetDonation()
    }
    return true
  }

  render({
    updateDonation,
    sendAmount,
    sendAmountValidationError,
    toggleCustomDonation,
    isSendAddressValid,
    percentageDonationValue,
    percentageDonationText,
    thresholdAmountReached,
  }) {
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
          'class': this.getButtonClass(40, 'fixed'),
          'value': 40, //TODO: config this
          'onClick': updateDonation,
          'disabled': !isFormValid || this.isInsufficient(40, 'fixed'),
          'aria-label': 'Fixed amount',
        },
        '40 ', //TODO: config this
        h(AdaIcon)
      ),
      h(
        'button',
        {
          'id': 'percentage',
          'class': this.getButtonClass(percentageDonationValue, 'percentage'),
          'value': percentageDonationValue,
          'onClick': updateDonation,
          'disabled':
            !isFormValid ||
            !thresholdAmountReached ||
            this.isInsufficient(percentageDonationValue, 'percentage'),
          'aria-label': 'Percentage amount',
        },
        `${percentageDonationText} (`,
        `${percentageDonationValue} `,
        h(AdaIcon),
        ')'
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
}

module.exports = connect(
  (state) => ({
    sendAmount: state.sendAmount.fieldValue,
    sendAmountValidationError: state.sendAmount.validationError,
    checkedDonationType: state.checkedDonationType,
    percentageDonationValue: state.percentageDonationValue,
    percentageDonationText: state.percentageDonationText,
    thresholdAmountReached: state.thresholdAmountReached,
    maxDonationAmount: state.maxDonationAmount,
  }),
  actions
)(DonationButtons)
