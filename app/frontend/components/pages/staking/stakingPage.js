const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

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
      errorMessage: !isEmailValid && 'Invalid email format.',
    })
  }

  render(
    {submitEmailSubscription, emailSubmitSuccess, emailSubmitMessage},
    {email, emailValid, errorMessage}
  ) {
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
          'We are planing to implement staking delegation interface so our users can easily stake their ADA to any stakepool directly from AdaLite. We also plan to operate our own AdaLite stake pool with reasonable fees and we hope AdaLite users will be willing to stake with us.'
        ),
        h(
          'form',
          {
            class: 'staking-form',
            id: 'stakingForm',
            // method: 'POST',
            // target: '_blank',
            // action: '',
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
              onClick: (e) => {
                e.preventDefault()
                emailValid ? submitEmailSubscription(email) : null
              },
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
        !emailValid && h('div', {class: 'validation-message error'}, errorMessage),
        emailSubmitSuccess && h('div', {class: 'form-alert success'}, emailSubmitMessage),
        !emailSubmitSuccess &&
          emailSubmitMessage &&
          h('div', {class: 'form-alert error'}, emailSubmitMessage)
        // have yet to reset message and success upon change
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    email: state.email,
    emailSubmitSuccess: state.emailSubmitSuccess,
    emailSubmitMessage: state.emailSubmitMessage,
  }),
  actions
)(StakingPage)
