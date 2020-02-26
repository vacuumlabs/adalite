import {h, Component} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

class StakingPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      emailValid: false,
      errorMessage: '',
    }

    this.isValidEmail = this.isValidEmail.bind(this)
    this.updateEmail = this.updateEmail.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  isValidEmail(email) {
    // eslint-disable-next-line max-len
    const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/gim
    return re.test(email)
  }

  updateEmail(e) {
    const isEmailValid = this.isValidEmail(e.target.value)
    this.setState({
      email: e.target.value,
      emailValid: isEmailValid,
      errorMessage: !isEmailValid && 'Invalid email format',
    })
    this.props.resetEmailSubmission()
  }

  handleSubmit(e) {
    e.preventDefault()
    if (this.state.emailValid) this.props.submitEmail(this.state.email)
  }

  render({emailSubmitSuccess, emailSubmitMessage}, {email, emailValid, errorMessage}) {
    return h(
      'div',
      {class: 'staking-wrapper'},
      h(
        'div',
        {class: 'staking-inner'},
        h('div', {class: 'staking-label'}, 'New'),
        h('h2', {class: 'staking-title'}, 'Staking with AdaLite'),
        h(
          'p',
          {class: 'staking-text'},
          'We released staking delegation interface so our users can access Shelley Testnet and easily delegate Incentivized Testnet ADA to any stake pool directly from AdaLite. We also improved the infrastructure of our stake pool which should be much more reliable now and we introduced very low 3% fee. You can access the delegation interface on ',
          h(
            'a',
            {href: 'https://testnet.adalite.io/', target: '_blank'},
            'https://testnet.adalite.io/'
          ),
          '. After release of the staking functionality on the Cardano main net, we will introduce this feature also on main site.'
        ),
        h(
          'div',
          {class: 'stakepool-info'},
          h('p', {}, 'AdaLite stake pool ticker: ', h('b', {}, 'ADLT1')),
          window.innerWidth > 767 &&
            h(
              'p',
              {},
              'Pool id: ',
              h('b', {}, 'f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49733c37b8f6')
            )
        ),
        h(
          'form',
          {
            class: 'staking-form',
            id: 'stakingForm',
          },
          h('input', {
            class: 'input',
            type: 'email',
            placeholder: 'Enter your email to get notified',
            value: email,
            required: true,
            onInput: this.updateEmail,
          }),
          h(
            'button',
            {
              onClick: this.handleSubmit,
              class: 'button primary wide',
              disabled: !emailValid,
              type: 'submit',
              onKeyDown: (e) => {
                e.key === 'Enter' && e.target.click()
              },
            },
            'Subscribe'
          )
        ),
        h(
          'div',
          {class: 'form-message-field'},
          !emailValid && h('div', {class: 'form-alert error'}, errorMessage),
          emailSubmitSuccess && h('div', {class: 'form-alert success'}, emailSubmitMessage),
          !emailSubmitSuccess &&
            emailSubmitMessage &&
            h('div', {class: 'form-alert error'}, emailSubmitMessage)
        )
      )
    )
  }
}

export default connect(
  (state) => ({
    email: state.email,
    emailSubmitSuccess: state.emailSubmitSuccess,
    emailSubmitMessage: state.emailSubmitMessage,
  }),
  actions
)(StakingPage)
