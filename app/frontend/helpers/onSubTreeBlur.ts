import {Ref} from 'preact/hooks'

// Put this inside onfocusout property
// This function ensure that:
// - clicking inside root node tree does not trigger callback and
// - clicking outside of root node tree does trigger callback
const onSubTreeBlur = (event, root: Ref<HTMLDivElement>, callback: () => void): void => {
  // node walk up the tree
  let target = event.relatedTarget // element receiving focus
  while (target && target !== root?.current) {
    target = target.parentElement
  }

  if (target !== root?.current) callback()
}

export default onSubTreeBlur
