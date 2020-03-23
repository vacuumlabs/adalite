const formatDate = (date) =>
  new Date(date * 1000).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hourCycle: 'h23',
  } as any)
// as any because there seems to be bug with hourCycle parameter

export default formatDate
