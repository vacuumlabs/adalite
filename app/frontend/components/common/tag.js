import {h} from 'preact'

const Tag = ({type, text}) => h('div', {class: `tag ${type}`}, h('span', {class: 'tag-text'}, text))

export default Tag
