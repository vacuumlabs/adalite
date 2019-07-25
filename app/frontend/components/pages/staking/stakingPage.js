const {h, Component} = require('preact')

class StakingPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      submitted: false,
    }
  }
  render() {
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
            method: 'POST',
            target: '_blank',
            action: '',
          },
          h('input', {
            class: 'input',
            type: 'email',
            placeholder: 'Enter your email to get notified',
            required: true,
          }),
          h(
            'button',
            {
              class: 'button primary wide',
              type: 'submit',
            },
            'Subscribe'
          )
        ),
        this.state.submitted &&
          h('div', {class: 'form-alert success'}, 'You are successfully subscribed.')
      )
    )
  }
}

module.exports = StakingPage
