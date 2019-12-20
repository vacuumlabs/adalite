const {h} = require('preact')

const StakingBanner = ({closeBanner}) =>
  h(
    'div',
    {class: 'banner'},
    h(
      'div',
      {class: 'banner-text'},
      'We launched our own Stake Pool. AdaLite will support staking. ',
      h(
        'a',
        {
          href: '#',
          onClick: (e) => {
            e.preventDefault()
            window.history.pushState({}, 'staking', 'staking')
          },
        },
        'Read more'
      )
    ),
    h('button', {
      'class': 'button close banner-close',
      'aria-label': 'Close banner',
      'onclick': (e) => {
        closeBanner()
      },
    })
  )

module.exports = StakingBanner
