// actions are just functions which also call update
{
  const {update} = window.e.redux

  const hello = () => {
    update({...window.store, hello: 'World'}, 'Say Hello')
  }

  const delayedHello = () => {
    update({...window.store, loading: true})
    setTimeout(() => {
      update({...window.store, loading: false, hello: 'Internet'}, 'Say... Hello')
    }, 1000)
  }

  const addTodo = (todo) => {
    update({...window.store, todos: window.store.todos.concat(todo)})
  }

  const setInputValue = (element) => {
    update({...window.store, controlledInputValue: element.value})
  }

  const exported = {
    delayedHello,
    hello,
    addTodo,
    setInputValue,
  }

  window.e = window.e ? {...window.e, actions: exported} : {actions: exported}
}
