/* eslint-disable max-len */
import {h} from 'preact'
import {useState, useCallback} from 'preact/hooks'
import submitEmailRaw from '../../../helpers/submitEmailRaw'
import debugLog from '../../../helpers/debugLog'

const newPools = new Set(['ADLT1', 'ADLT0'])
const ADLTPools = [
  ['ADLT9', '481d305a21bbbaa85177413676ba350b1e2d7b7456b8008e72b96386'],
  ['ADLT8', '03fbee96b84daa1bf91c44b51d2e1cbdda53fd504c98aeb6fd4a55b6'],
  ['ADLT7', 'd5e0f919debe82e4447cf0f0089188ae212f7efbc065a3d819daa17a'],
  ['ADLT6', 'cf69a3eca039d537acd46d5864a54dd8953f0c14be957350905834aa'],
  ['ADLT5', '936f24e391afc0738c816ae1f1388957b977de3d0e065dc9ba38af8d'],
  ['ADLT4', 'd785ff6a030ae9d521770c00f264a2aa423e928c85fc620b13d46eda'],
  ['ADLT3', '92229dcf782ce8a82050fdeecb9334cc4d906c6eb66cdbdcea86fb5f'],
  ['ADLT2', 'ce19882fd62e79faa113fcaef93950a4f0a5913b20a0689911b6f62d'],
  ['ADLT1', 'c779f67a0f3a1f2985626e345013015f71cf245dbcc8ac8457f42e56'],
  ['ADLT0', 'a0fc643d831b144e1dd289f5acf4274aedc331b6a0e4257ef5376520'],
  ['ADLT', '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438'],
]

const isValidEmail = (email) => {
  // eslint-disable-next-line max-len
  const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/gim
  return re.test(email)
}

interface UseEmailSubmitPropsState {
  email: string
  emailValid: boolean
  errorMessage: string
  emailSubmitSuccess: boolean
  emailSubmitMessage: string
}

const useEmailSubmitProps = () => {
  const [state, setState] = useState<UseEmailSubmitPropsState>({
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
        errorMessage: emailValid ? '' : 'Invalid email format',
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
        throw new Error('EmailSubmissionRejected')
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
          After Cardano Shelley hard-fork on the July 29th staking was introduced to Cardano.
          AdaLite will provide compatibility with the new Shelley address format and transactions.
          We also released the staking interface for main-net. Please report any bugs that you may
          find in our wallet. Follow our Telegram and Twitter to be informed about changes and
          release dates for hardware wallets support.
        </p>
        <p className="staking-text">
          In order to stake, you need to transfer your funds from old Byron address format to new
          Shelley address format. Transaction that will do this automatically can be created easily
          from the staking interface.
        </p>
        <p className="staking-text">
          We are running our own reliable staking pools with a very low 3% fee. By delegating your
          stake to us you are supporting the development of AdaLite.
        </p>

        {window.innerWidth > 767 && (
          <div className="stakepool-info">
            {ADLTPools.map(([ticker, hash], i) => (
              <p key={i}>
                <a href={`https://pooltool.io/pool/${hash}`} target="_blank">
                  {` ${ticker}`}
                </a>
                :{' '}
                <b>
                  {hash}
                  {newPools.has(ticker) && ' (NEW)'}
                </b>
              </p>
            ))}
          </div>
        )}
        {window.innerWidth <= 767 && (
          <p className="staking-text">
            You can check out our pools on pooltool with tickers{' '}
            {ADLTPools.map(([ticker, hash], i) => (
              <span key={i}>
                {i === ADLTPools.length - 1 && 'and '}
                <a href={`https://pooltool.io/pool/${hash}`} target="_blank">
                  {ticker}
                </a>
                {newPools.has(ticker) && <b> (NEW)</b>}
                {i === ADLTPools.length - 1 ? '.' : ', '}
              </span>
            ))}
          </p>
        )}

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
          {!emailSubmitSuccess && emailSubmitMessage && (
            <div className="form-alert error">{emailSubmitMessage}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StakingPage
