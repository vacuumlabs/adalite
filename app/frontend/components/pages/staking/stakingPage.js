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
          'We are currently implementing staking delegation interface so our users can easily stake their Incentivized Testnet ADA to any stakepool directly from AdaLite. This feature will be available around Christmas on ',
          h(
            'a',
            {href: 'https://testnet.adalite.io/', target: '_blank'},
            'https://testnet.adalite.io/'
          ),
          '. Currently you can only check your Testnet balance there.'
        ),
        h(
          'p',
          {class: 'staking-text'},
          'We launched our own AdaLite stake pool and we hope AdaLite users will be willing to stake with us.'
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
              h('b', {}, 'a19af49ed88574bd181022c38904d76482be0e57778f3ee28a6abf3769d6ac46')
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

module.exports = connect(
  (state) => ({
    email: state.email,
    emailSubmitSuccess: state.emailSubmitSuccess,
    emailSubmitMessage: state.emailSubmitMessage,
  }),
  actions
)(StakingPage)
