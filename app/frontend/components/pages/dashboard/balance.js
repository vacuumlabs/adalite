const {h} = require('preact')
const printAda = require('../../../helpers/printAda')

const Balance = ({balance}) =>
  h(
    'div',
    {class: 'balance-block'},
    h('h2', undefined, 'Balance'),
    h(
      'p',
      {class: 'balance-value'},
      h('span', undefined, isNaN(Number(balance)) ? balance : `${printAda(balance)}`),
      h('img', {class: 'ada-sign-big', alt: 'ADA', src: '/assets/ada.png'})
    )
  )

module.exports = Balance
