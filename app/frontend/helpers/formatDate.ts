import toLocalDate from './toLocalDate'

const formatDate = (date) => toLocalDate(new Date(date * 1000))

export default formatDate
