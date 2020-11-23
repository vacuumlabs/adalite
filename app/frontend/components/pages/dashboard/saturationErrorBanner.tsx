import {h} from 'preact'

const SaturationErrorBanner = () => {
  return (
    <div style={'width: 100%;margin-bottom: 20px;'}>
      <div className="banner saturation">
        <div className="banner-text">
          The pool you are delegating is or will become saturated after the 1st December. Delegate
          to another pool to get optimal rewards. For more information read{' '}
          <a
            target="_blank"
            style={'color: white;'}
            href="https://medium.com/@adalite/attention-all-cardano-stake-delegators-important-change-coming-on-december-1st-d6887c9ba13b"
          >
            here.
          </a>
        </div>
      </div>
    </div>
  )
}

export default SaturationErrorBanner
