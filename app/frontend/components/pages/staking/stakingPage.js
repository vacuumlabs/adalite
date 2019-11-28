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
        h('div', {class: 'staking-label'}, 'Upcoming'),
        h(
          'h2',
          {class: 'staking-title'},
          'Staking delegation and staking pool is coming to AdaLite'
        ),
        h(
          'p',
          {class: 'staking-text'},
          'We are currently implementing staking delegation interface so our users can easily stake their ADA to any stakepool directly from AdaLite. We also plan to operate our own AdaLite stake pool with reasonable fees and we hope AdaLite users will be willing to stake with us. You can check out the new balance check feature ',
          h('a', {href: 'https://testnet.adalite.io/', target: '_blank'}, 'here.')
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
