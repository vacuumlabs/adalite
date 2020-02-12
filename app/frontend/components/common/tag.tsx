import {h} from 'preact'

interface Props {
  type: string
  text: string
}

const Tag = ({type, text}: Props) => (
  <div className={`tag ${type}`}>
    <span className="tag-text">{text}</span>
  </div>
)

export default Tag
