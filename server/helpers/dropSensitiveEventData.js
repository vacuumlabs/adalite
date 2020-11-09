module.exports = function dropSensitiveEventData(event) {
  if (event.request && event.request.data) delete event.request.data
  if (event.request && event.request.cookies) delete event.request.cookies
  // otherwise all errors would have generic names
  event.exception.values[0].type = event.exception.values[0].value
  return event
}
