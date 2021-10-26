const dataConfigString = document.body.getAttribute('data-config') || '{}'
const ADALITE_CONFIG = JSON.parse(dataConfigString)

export {ADALITE_CONFIG}
