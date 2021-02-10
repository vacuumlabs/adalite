import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {AdaIcon} from '../../common/svg'
import {ADALITE_CONFIG} from '../../../config'
import {toCoins} from '../../../helpers/adaConverters'
import tooltip from '../../common/tooltip'

const {ADALITE_FIXED_DONATION_VALUE} = ADALITE_CONFIG

interface Props {
  maxDonationAmount: number
  checkedDonationType: any
  resetDonation: () => void
  updateDonation: any
  sendAmount: number
  sendAmountValidationError: string
  toggleCustomDonation: any
  isSendAddressValid: boolean
  percentageDonationValue: any
  percentageDonationText: string
  isThresholdAmountReached: any
}

class DonationButtons extends Component<Props> {
  constructor(props) {
    super(props)
    this.getButtonClass = this.getButtonClass.bind(this)
    this.isInsufficient = this.isInsufficient.bind(this)
  }

  getButtonClass(donationAmount, type) {
    if (toCoins(donationAmount) > this.props.maxDonationAmount) {
      return 'button donate insufficient'
    }
    return this.props.checkedDonationType === type ? 'button donate active' : 'button donate'
  }

  isInsufficient(donationAmount, type) {
    if (toCoins(donationAmount) <= this.props.maxDonationAmount) {
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
    isThresholdAmountReached,
  }) {
    const isFormValid = isSendAddressValid && sendAmount && !sendAmountValidationError
    const isFixedInsufficient = this.isInsufficient(ADALITE_FIXED_DONATION_VALUE, 'fixed')
    const isPercentageInsufficient = this.isInsufficient(percentageDonationValue, 'percentage')
    return (
      <div className="send-donate">
        <button
          id="fixed"
          className={`${this.getButtonClass(
            ADALITE_FIXED_DONATION_VALUE,
            'fixed'
          )} thin-data-balloon`}
          value={ADALITE_FIXED_DONATION_VALUE}
          onClick={updateDonation}
          disabled={!isFormValid || isFixedInsufficient}
          {
          ...{ariaLabel: 'Fixed amount'} /* ignore ts error */
          }
          {...tooltip('Insufficient funds', isFixedInsufficient)}
        >
          {`${ADALITE_FIXED_DONATION_VALUE} `}
          <AdaIcon />
        </button>
        <button
          id="percentage"
          className={`${this.getButtonClass(
            percentageDonationValue,
            'percentage'
          )} thin-data-balloon`}
          value={percentageDonationValue}
          onClick={updateDonation}
          disabled={!isFormValid || !isThresholdAmountReached || isPercentageInsufficient}
          {
          ...{ariaLabel: 'Percentage amount'} /* ignore ts error */
          }
          {...tooltip('Insufficient funds', isPercentageInsufficient)}
        >
          {`${percentageDonationText} (`}
          {`${percentageDonationValue} `}
          <AdaIcon />)
        </button>
        <button
          className="button donate"
          id="custom"
          onClick={toggleCustomDonation}
          disabled={!isFormValid}
        >
          Custom
        </button>
      </div>
    )
  }
}

export default connect(
  // TODO: hotfix until we refactor this to functional component
  (state: any) => ({
    sendAmount: state.sendAmount.fieldValue,
    sendAmountValidationError: state.sendAmountValidationError,
    checkedDonationType: state.checkedDonationType,
    percentageDonationValue: state.percentageDonationValue,
    percentageDonationText: state.percentageDonationText,
    isThresholdAmountReached: state.isThresholdAmountReached,
    maxDonationAmount: state.maxDonationAmount,
  }),
  actions
)(DonationButtons)
