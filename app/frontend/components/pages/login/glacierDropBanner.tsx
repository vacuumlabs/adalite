import printTokenAmount from '../../../helpers/printTokenAmount'
import {useSelector} from '../../../helpers/connect'
import {h} from 'preact'
import {useEffect, useState} from 'preact/hooks'
import BigNumber from 'bignumber.js'

const GlacierDropBanner = () => {
  const {accountsInfo} = useSelector((state) => ({
    accountsInfo: state.accountsInfo,
  }))
  const [glacierDropTokensAllocation, setGlacierDropTokensAllocation] = useState({
    total: new BigNumber(0),
    accounts: 0,
  })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const accountsEligible = accountsInfo.filter((account) =>
      account.glacierDropEligibility.gdTokenAmount.gt(0)
    )
    const totalEligible = accountsInfo.reduce(
      (acc, account) => acc.plus(account.glacierDropEligibility.gdTokenAmount),
      new BigNumber(0)
    )

    setGlacierDropTokensAllocation({
      total: totalEligible,
      accounts: accountsEligible.length,
    })
  }, [accountsInfo])

  const handleClose = () => {
    setIsVisible(false)
  }

  if (glacierDropTokensAllocation.total.lte(1) || !isVisible) {
    return null
  }

  return (
    <div
      className="glacier-drop-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#0000fe',
        color: 'white',
        padding: '12px 16px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{flex: 1}}>
        You are eligible to claim{' '}
        <b>{printTokenAmount(glacierDropTokensAllocation.total, 6).split('.')[0]} NIGHT</b> from{' '}
        {glacierDropTokensAllocation.accounts} of your accounts in Midnight Network's airdrop; learn
        how AdaLite users can claim NIGHT using NuFi wallet{' '}
        <a
          href="https://support.nu.fi/support/solutions/articles/80001181779"
          target="_blank"
          rel="noopener noreferrer"
          style={{color: 'white'}}
        >
          here.
        </a>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 8px',
          marginLeft: '16px',
          opacity: 0.8,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8'
        }}
        aria-label="Close banner"
      >
        ×
      </button>
    </div>
  )
}

export default GlacierDropBanner
