import {connect as _connect} from '../libs/unistore/preact'
import {useStore as _useStore, useSelector as _useSelector} from '../libs/preact-hooks-unistore'
import {mapActions} from '../libs/unistore/util'
// (eslint is confused with types)
// eslint-disable-next-line
import {State} from '../state'
import {ComponentClass, FunctionComponent} from 'preact'
import {useMemo} from 'preact/hooks'

// Note(ppershing): Enjoy generic insanity!

type ComponentType<P> = ComponentClass<P, any> | FunctionComponent<P>

type ComponentToProps<C> = C extends ComponentType<infer P> ? P : never

type StripStateArg<Fn> = Fn extends (state: State, ...rest: infer T) => any
  ? (...rest: T) => ReturnType<Fn>
  : never

type BindActions<UnboundActions> = {[K in keyof UnboundActions]: StripStateArg<UnboundActions[K]>}

type Connect = <StateProps = {}, UnboundActions = {}>(
  mapStateToProps: null | ((state: State) => StateProps),
  mapActionsToProps?: (store: any) => UnboundActions
) => HOC<StateProps & BindActions<UnboundActions>>

// prettier-ignore
type HOC<ConnectedProps> = <Child>(
  c: Child
) => ComponentType<
  Omit<
    CheckPropsCompatibility<ComponentToProps<Child>, ConnectedProps>,
    keyof ConnectedProps
  >
>

type CommonKeys<Obj1, Obj2> = Extract<keyof Obj1, keyof Obj2>

// Component types must match those that are injected, however, they can also be any
// prettier-ignore
type CheckPropsCompatibility<Obj1, Obj2> = (
  Pick<Obj1, CommonKeys<Obj1, Obj2>> extends Pick<Obj2, CommonKeys<Obj1, Obj2>>
  ? Obj1
  : never
)

const connect: Connect = _connect

const useStore: any = _useStore

type UseSelector = <T>(selector: (state: State) => T) => T
const useSelector: UseSelector = _useSelector

type UseActions = <T>(actions: (store: any) => T) => BindActions<T>
const useActions: UseActions = (actions) => {
  const store = useStore()
  return useMemo(() => mapActions(actions, store), [actions, store])
}

export {connect, useStore, useSelector, useActions}
