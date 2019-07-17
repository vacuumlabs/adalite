const {h} = require('preact')

const StakingPage = () =>
  h(
    'div',
    {class: 'staking-wrapper'},
    h('div', {class: 'staking-label'}, 'Upcoming'),
    h('h2', {class: 'staking-title'}, 'Staking delegation and staking pool is comming to AdaLite'),
    h(
      'p',
      {class: 'staking-text'},
      'We are planing to implement staking delegation interface so our users can easily stake their ADA to any stakepool directly from AdaLite. We also plan to operate our own AdaLite stake pool with reasonable fees and we hope AdaLite users will be willing to stake with us.'
    ),
    h(
      'form',
      {class: 'staking-form'},
      h('input', {
        class: 'input',
        type: 'email',
        placeholder: 'Enter your email to get notified',
      }),
      h(
        'button',
        {
          class: 'button primary wide',
          type: 'submit',
        },
        'Subscribe'
      )
    )
  )

module.exports = StakingPage
