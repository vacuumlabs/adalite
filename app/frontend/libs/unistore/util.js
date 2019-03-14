/* eslint-disable */
/*
* unistore 3.0.5
* source: https://github.com/developit/unistore/blob/bbf936d6829bc4fbbc1a3fc242bf00153b0ec337/src/util.js
*/

// Bind an object/factory of actions to the store and wrap them.
function mapActions(actions, store) {
  if (typeof actions === 'function') actions = actions(store)
  let mapped = {}
  for (let i in actions) {
    mapped[i] = store.action(actions[i])
  }
  return mapped
}

// select('foo,bar') creates a function of the form: ({ foo, bar }) => ({ foo, bar })
function select(properties) {
  if (typeof properties === 'string') properties = properties.split(/\s*,\s*/)
  return (state) => {
    let selected = {}
    for (let i = 0; i < properties.length; i++) {
      selected[properties[i]] = state[properties[i]]
    }
    return selected
  }
}

// Lighter Object.assign stand-in
function assign(obj, props) {
  for (let i in props) obj[i] = props[i]
  return obj
}

module.exports = {
  mapActions,
  select,
  assign,
}
