import {Fragment, h} from 'preact'
import {useState, useCallback} from 'preact/hooks'
import {DropdownCaret} from './svg'

interface Props {
  initialVisibility: Boolean
  header: h.JSX.Element
  body: h.JSX.Element
}

const Accordion = ({initialVisibility, header, body}: Props) => {
  const [visible, setVisible] = useState(initialVisibility)
  const toggleVisibility = useCallback(
    () => {
      setVisible(!visible)
    },
    [visible]
  )

  return (
    <Fragment>
      <div className="accordion space-between" onClick={toggleVisibility}>
        <div>{header}</div>
        <div className={`accordion-icon ${visible ? 'shown' : 'hidden'}`}>
          <DropdownCaret />
        </div>
      </div>
      <div className={`accordion-panel ${visible ? 'shown' : 'hidden'}`}>{body}</div>
    </Fragment>
  )
}

export default Accordion
