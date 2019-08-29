const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

class CustomInputButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonVal: 0,
      buttonText: '',
    }

    this.setDonation = this.setDonation.bind(this)
    this.updateValAndText = this.updateValAndText.bind(this)
  }

  setDonation() {
    this.props.setDonation(this.state.buttonVal)
  }

  updateValAndText() {
    let buttonText, buttonVal
    if (this.props.percentageDonationValue < 1) {
      buttonText = '1A' //TODO: sign
      buttonVal = 1
    } else {
      buttonText = `${this.props.percentageDonationText} (${this.props.percentageDonationValue})`
      buttonVal = this.props.percentageDonationValue
    }

    if (this.props.donationAmount.coins > this.props.maxDonationAmount) {
      //TODO: border
      //transform amount from lovelaces to ada floored on 3rd decimal
      const maxDonationAmountInAda = Math.floor(this.props.maxDonationAmount * 0.001) / 1000
      buttonText = `Max (${maxDonationAmountInAda})`
      buttonVal = maxDonationAmountInAda
    }

    this.setState({
      buttonText,
      buttonVal,
    })
  }

  componentDidMount() {
    this.updateValAndText()
  }

  componentDidUpdate(prevProps) {
    if (this.props.donationAmount.coins !== prevProps.donationAmount.coins) {
      this.updateValAndText()
    }
  }

  render({isSendAddressValid}) {
    return h(
      'button',
      {
        class: 'button send-max',
        onClick: this.setDonation,
        disabled: !isSendAddressValid,
      },
      `${this.state.buttonText}`
    )
  }
}

module.exports = connect(
  (state) => ({
    donationAmount: state.donationAmount,
    maxDonationAmount: state.maxDonationAmount,
    percentageDonationText: state.percentageDonationText,
    percentageDonationValue: Math.floor(state.percentageDonationValue * 1000) / 1000,
  }),
  actions
)(CustomInputButton)
