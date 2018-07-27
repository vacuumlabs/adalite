const {h} = require('preact')
const printAda = require('../../../helpers/printAda')
const AdaIcon = require('../../common/svg').AdaIcon

const Balance = ({balance}) =>
  h(
    'div',
    {class: 'balance-block'},
    h('h2', undefined, 'Balance'),
    h(
      'p',
      {class: 'balance-value'},
      h('span', undefined, isNaN(Number(balance)) ? balance : `${printAda(balance)}`),
      h(AdaIcon, {className: 'ada-sign-big'})
    )
  )

module.exports = Balance
