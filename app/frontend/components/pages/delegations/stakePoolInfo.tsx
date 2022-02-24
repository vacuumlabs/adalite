import printAda from '../../../helpers/printAda'
import {unescape} from 'lodash'
import {getErrorMessage} from '../../../errors'
import {Stakepool, Lovelace} from '../../../types'
import {h} from 'preact'
import tooltip from '../../common/tooltip'

// REFACTOR: (Untyped errors): move to types
// is "hasTickerMapping" something specific or general?
type Error = {
  code: string
  params?: {hasTickerMapping: boolean | undefined}
}

type StakePoolInfoProps = {
  pool?: Stakepool | null
  gettingPoolInfo: boolean
  validationError: Error | null
}

export const StakePoolInfo = ({
  pool,
  gettingPoolInfo,
  validationError,
}: StakePoolInfoProps): h.JSX.Element => {
  const print = (
    fieldValue: string | number | null | undefined,
    format?: (fieldValue: string | number) => string | h.JSX.Element
  ): string | h.JSX.Element => {
    if (pool) {
      if (fieldValue != null) {
        if (format) {
          return format(fieldValue)
        }
        return `${fieldValue}`
      }
      return <span className="delegation field-na">n/a</span>
    } else {
      return ''
    }
  }
  return (
    <div className={`stake-pool-info ${validationError ? 'invalid' : 'valid'}`}>
      {validationError ? (
        <div>{getErrorMessage(validationError.code, validationError.params)}</div>
      ) : gettingPoolInfo ? (
        <div>Getting pool info..</div>
      ) : (
        <div>
          <div>
            {'Name: '}
            {print(unescape(pool?.name))}
          </div>
          <div className="delegation stake-pool-id">
            {'Stake Pool ID: '}
            {print(pool?.poolHash)}
          </div>
          <div>
            {'Ticker: '}
            {print(pool?.ticker)}
          </div>
          <div>
            <a
              {...tooltip(
                'Tax is deducted from the rewards that pool distributes to the delegators.',
                true
              )}
            >
              <span className="delegation show-info">{''}</span>
            </a>
            {'Tax: '}
            {print(pool?.margin, (margin: number) => `${margin * 100}%`)}
          </div>
          <div>
            <a
              {...tooltip(
                'Fixed cost of the pool is taken from the pool rewards every epoch. This fee is shared among all delegators of the pool, not per delegator. Minimum value is 340 ADA.',
                true
              )}
            >
              <span className="delegation show-info">{''}</span>
            </a>
            {'Fixed cost: '}
            {print(pool?.fixedCost, (cost: string) => printAda(parseInt(cost, 10) as Lovelace))}
          </div>
          <div>
            {'Homepage: '}
            {print(pool?.homepage, (homepage: string) => (
              <a target="_blank" href={homepage}>
                {homepage}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
