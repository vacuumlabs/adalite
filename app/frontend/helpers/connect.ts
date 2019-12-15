import {connect as _connect} from '../libs/unistore/preact'
// (eslint is confused with types)
// eslint-disable-next-line
import {State} from '../state'
import {ComponentClass, FunctionComponent} from 'preact'

// Note(ppershing): Enjoy generic insanity!

type ComponentType<P> = ComponentClass<P, any> | FunctionComponent<P>

type ComponentToProps<C> = C extends ComponentType<infer P> ? P : never

type StripStateArg<Fn> = Fn extends (state: State, ...rest: infer T) => any
  ? (...rest: T) => any
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

export {connect}
