import {h} from 'preact'
import {useState, useCallback} from 'preact/hooks'
import submitEmailRaw from '../../../helpers/submitEmailRaw'
import NamedError from '../../../helpers/NamedError'
import debugLog from '../../../helpers/debugLog'

const isValidEmail = (email) => {
  // eslint-disable-next-line max-len
  const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/gim
  return re.test(email)
}

const useEmailSubmitProps = () => {
  const [state, setState] = useState({
    email: '',
    emailValid: false,
    errorMessage: '',
    emailSubmitSuccess: false,
    emailSubmitMessage: '',
  })

  const updateEmail = useCallback(
    (e) => {
      const email = e.target.value
      const emailValid = isValidEmail(email)
      setState({
        email,
        emailValid,
        errorMessage: !emailValid && 'Invalid email format',
        emailSubmitSuccess: false,
        emailSubmitMessage: '',
      })
    },
    [setState]
  )

  const setSendingResult = useCallback(({didSucceed, message}) => {
    setState((state) => ({
      ...state,
      emailSubmitSuccess: didSucceed,
      emailSubmitMessage: message,
    }))
  }, [])

  const submitEmail = async (email) => {
    let didSucceed
    let message
    try {
      const emailSubmitResult = await submitEmailRaw(email)

      if (emailSubmitResult.Left) {
        didSucceed = false
        message = emailSubmitResult.Left
        throw NamedError('EmailSubmissionRejected')
      }

      didSucceed = true
      message = emailSubmitResult.Right
    } catch (e) {
      debugLog(e)
    } finally {
      setSendingResult({didSucceed, message})
    }
  }

  return {...state, updateEmail, submitEmail}
}

const StakingPage = () => {
  const {
    email,
    emailValid,
    updateEmail,
    emailSubmitSuccess,
    emailSubmitMessage,
    submitEmail,
    errorMessage,
  } = useEmailSubmitProps()

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!emailValid) return
      await submitEmail(email)
    },
    [email, emailValid, submitEmail]
  )

  return (
    <div className="staking-wrapper">
      <div className="staking-inner">
        <div className="staking-label">New</div>
        <h2 className="staking-title">Staking with Adalite</h2>
        <p className="staking-text">
          We released staking delegation interface so our users can access Shelley Testnet and
          easily delegate Incentivized Testnet ADA to any stake pool directly from AdaLite. We also
          improved the infrastructure of our stake pool which should be much more reliable now and
          we introduced very low 3% fee. You can access the delegation interface on{' '}
          <a href="https://testnet.adalite.io/" target="_blank">
            https://testnet.adalite.io/
          </a>
          {'. '} After release of the staking functionality on the Cardano main net, we will
          introduce this feature also on main site. The testnet phase is estimated to end in Q2-Q3
          2020.
        </p>
        <p className="staking-text">
          Users who had balance on their mnemonic wallets in the time of{' '}
          <b>Shelley balance snapshot</b> (29.11.2019) can access the testnet and and stake this
          balance. The purpose of staking on testnet is to help IOHK team to refine staking
          functionality. Participating users will be able to transfer all the rewards earned with
          staking to their main-net wallets at the end of testnet phase.
        </p>
        <p className="staking-text">
          Please note that Staking is possible on Cardano testnet for <b>mnemonic wallets only</b>.
          HW wallets are not supported yet but the support should be added before release of the
          staking functionality to the main-net.
        </p>
        <div className="stakepool-info">
          <p>
            AdaLite stake pool ticker: <b>ADLT1</b>
            {window.innerWidth > 767 && (
              <p>
                Pool id: <b>f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49733c37b8f6</b>
              </p>
            )}
          </p>
        </div>

        <form className="staking-form" id="stakingForm">
          <input
            className="input"
            type="email"
            placeholder="Enter your email to get notified"
            value={email}
            required
            onInput={updateEmail}
          />
          <button
            onClick={handleSubmit}
            className="button primary wide"
            disabled={!emailValid}
            type="submit"
            onKeyDown={(e) => {
              e.key === 'Enter' && (e.target as HTMLButtonElement).click()
            }}
          >
            Subscribe
          </button>
        </form>
        <div className="form-message-field">
          {!emailValid && <div className="form-alert error">{errorMessage}</div>}
          {emailSubmitSuccess && <div className="form-alert success">{emailSubmitMessage}</div>}
          {!emailSubmitSuccess &&
            emailSubmitMessage && <div className="form-alert error">{emailSubmitMessage}</div>}
        </div>
      </div>
    </div>
  )
}

export default StakingPage
