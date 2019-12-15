module.exports = (file, api) => {
  const j = api.jscodeshift

  const transform_children = (children) => {
    const res = children.map((c) => {
      // nested component
      if (c.type === 'SpreadElement') {
        return j.jsxExpressionContainer(c.argument)
      } else if (c.type === 'CallExpression' && c.callee.name === 'h') {
        // eslint-disable-next-line no-use-before-define
        return transform_h_call(c)
      } else if (
        c.type === 'StringLiteral' &&
        c.value &&
        !/[{}]/.test(c.value) // recast willingly puts string's {} inside raw which breaks things
      ) {
        // Note(ppershing): damn recast
        // https://github.com/benjamn/recast/commit/edf8c7814e632779de4b8a482373c3cfb50cb547
        c.value = c.value.replace(/^ /, "{' '}")
        c.value = c.value.replace(/ $/, "{' '}")
        return c
      } else {
        return j.jsxExpressionContainer(c)
      }
    })
    return res
  }

  const transform_prop = (attr) => {
    // turns prop object's {key:value} into jsx
    if (attr.type === 'SpreadElement') {
      return j.jsxSpreadAttribute(attr.argument)
    }

    // xmlns:attr -> xmlnsAttr, some-prop -> someProp
    const fix_attr_name = (str) => str.replace(/[:-][a-z]/, (m) => m[1].toUpperCase()).replace('class', 'className')

    return j.jsxAttribute(
      j.jsxIdentifier(fix_attr_name(attr.key.name || attr.key.value)),
      // we put literals raw, otherwise wrap in {}
      attr.value.type === 'StringLiteral' ? attr.value : j.jsxExpressionContainer(attr.value)
    )
  }

  const transform_h_call = (node) => {
    // call signature is h('div', { prop1: val1, prop2: val2 }, ...children)
    const h_args = node.arguments

    // could be 'div' or myComponent, e.g. literal.value or identifier.name
    const el = h_args[0].value || h_args[0].name

    const props = (h_args[1] || {}).properties || []

    const children = h_args.slice(2)

    // self-close if no children, otherwise do full tag
    if (children.length) {
      return j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier(el), (props || []).map(transform_prop)),
        j.jsxClosingElement(j.jsxIdentifier(el)),
        transform_children(children)
      )
    } else {
      return j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier(el), (props || []).map(transform_prop), true)
      )
    }
  }

  return j(file.source)
    .find(j.CallExpression, {
      callee: {
        name: 'h',
      },
    })
    .replaceWith((p) => {
      return transform_h_call(p.value)
    })
    .toSource()
}
