const {h} = require('preact')

const Tag = ({type, text}) => h('div', {class: `tag ${type}`}, h('span', {class: 'tag-text'}, text))

module.exports = Tag
