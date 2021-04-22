import {Fragment, h} from 'preact'

const ProgressStep = ({active, name}: {active: boolean; name: string}): h.JSX.Element => {
  return (
    <Fragment>
      <div className={`progress-step ${active ? 'active' : ''}`} />
      <div className={`progress-step-text ${active ? 'active' : ''}`}>{name}</div>
    </Fragment>
  )
}

const ProgressBar = ({
  stepNames,
  activeStep,
}: {
  stepNames: string[]
  activeStep: number
}): h.JSX.Element => {
  return (
    <div className="progress-bar">
      {stepNames.map((step, i) => (
        <ProgressStep name={step} active={activeStep >= i} key={i} />
      ))}
    </div>
  )
}

export default ProgressBar
