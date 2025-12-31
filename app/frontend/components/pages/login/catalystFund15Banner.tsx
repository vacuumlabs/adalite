import {h} from 'preact'
import {useState} from 'preact/hooks'

const CatalystFund15Banner = () => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
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
        <b>{'We need your help!'}</b>
        &nbsp; Register to vote in Cardano's Project Catalyst (before Jan. 4th) and support NUFI's
        proposals. &nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          style={{color: 'white'}}
          href="https://nu.fi/blog/project-catalyst-fund15"
        >
          Details &rarr;
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

export default CatalystFund15Banner
