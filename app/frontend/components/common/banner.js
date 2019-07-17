const {h} = require('preact')

const Banner = () =>
  h(
    'div',
    {class: 'banner'},
    h(
      'div',
      {class: 'banner-inner'},
      h(
        'div',
        {class: 'banner-text'},
        'AdaLite will support staking. ',
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
      })
    )
  )

module.exports = Banner
