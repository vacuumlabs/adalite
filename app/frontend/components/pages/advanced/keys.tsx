import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

const Keys = ({pool, nearestReward, currentDelegationReward}) => {
  return <Fragment>lol</Fragment>
}

export default connect(
  (state) => ({
    pool: state.shelleyAccountInfo.delegation,
    delegationValidationError: state.delegationValidationError,
    calculatingDelegationFee: state.calculatingDelegationFee,
    nearestReward: state.shelleyAccountInfo.rewardDetails.nearest,
    currentDelegationReward: state.shelleyAccountInfo.rewardDetails.currentDelegation,
  }),
  actions
)(Keys)
