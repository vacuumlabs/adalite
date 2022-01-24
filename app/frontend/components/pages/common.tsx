import toLocalDate from '../../../frontend/helpers/toLocalDate'
import {h} from 'preact'

export const EpochDateTime = ({
  epoch,
  dateTime,
  className = '',
}: {
  epoch: number
  dateTime: Date
  className?: string
}) => {
  return (
    <span className={`epoch-date-time ${className}`}>
      Epoch {epoch}, {toLocalDate(dateTime)}
    </span>
  )
}
