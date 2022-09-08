import {h, JSX} from 'preact'

const tooltip = (message, enabled, displayAlways?: boolean) => {
  return displayAlways !== undefined
    ? {
      'data-balloon': message,
      'data-balloon-visible': displayAlways ? 'true' : '',
    }
    : enabled && {
      'data-balloon': message,
    }
}

export default tooltip

export const visitNufiTooltip = ({
  content,
  tooltipMessage,
  style,
}: {
  content: JSX.Element
  tooltipMessage: string
  style?: {[key: string]: string}
}) => {
  return (
    <div className="nufi-tooltip-wrapper" style={style}>
      <p>
        <span {...tooltip(tooltipMessage, true)}>
          <span className="show-info show-info-start">{''}</span>
        </span>
        {content}
      </p>
    </div>
  )
}
