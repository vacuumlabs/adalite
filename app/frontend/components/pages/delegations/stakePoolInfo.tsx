import printAda from '../../../helpers/printAda'
import {getTranslation} from '../../../translations'
import {Stakepool, Lovelace} from '../../../types'
import {h} from 'preact'
import tooltip from '../../common/tooltip'

type StakePoolInfoProps = {
  pool?: Stakepool
  gettingPoolInfo: boolean
}

export const StakePoolInfo = ({pool, gettingPoolInfo}: StakePoolInfoProps): h.JSX.Element => {
  const print = (
    fieldValue: string | number | null,
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
    <div className={`stake-pool-info ${pool?.validationError ? 'invalid' : 'valid'}`}>
      {pool?.validationError ? (
        <div>{getTranslation(pool?.validationError.code, pool?.validationError.params)}</div>
      ) : gettingPoolInfo ? (
        <div>Getting pool info..</div>
      ) : (
        <div>
          <div>
            {'Name: '}
            {print(pool?.name)}
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
