import {h} from 'preact'

interface Props {
  type: string
  text: string
}

const Tag = ({type, text}: Props) =>
  h('div', {class: `tag ${type}`}, h('span', {class: 'tag-text'}, text))

export default Tag
