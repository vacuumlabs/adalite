const nodeWalk = (node, func) => {
  if (node) {
    let result = func(node)
    for (node = node.firstChild; result !== false && node; node = node.nextSibling) {
      result = nodeWalk(node, func)
    }
    return result
  } else {
    return false
  }
}

const getCaretPosition = (elem) => {
  const sel = window.getSelection()
  const caretNode = sel.focusNode === elem ? elem.childNodes.item(sel.focusOffset) : sel.focusNode
  const offset = sel.focusNode === elem ? 0 : sel.focusOffset

  if (elem.contains(caretNode)) {
    let length = 0

    nodeWalk(elem, (node) => {
      if (node === caretNode) {
        return false
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        length += node.textContent.length
      }
      return true
    })

    return length + offset
  } else {
    return elem.textContent.length
  }
}

const setCaretPosition = (elem, position) => {
  let targetNode = elem
  let length = 0

  nodeWalk(elem, (node) => {
    targetNode = node

    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      if (length + node.textContent.length >= position) {
        return false
      } else {
        length += node.textContent.length
      }
    }

    return true
  })

  const newRange = document.createRange()
  newRange.setStart(targetNode, position - length)
  newRange.collapse(true)

  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(newRange)
}

export {getCaretPosition, setCaretPosition}
