import {h} from 'preact'

const GovernanceVotingCard = (): h.JSX.Element => {
  return (
    <div className="card" data-cy="VotingCard">
      <h2 className="card-title">Cardano Governance Voting</h2>
      <p className="info-spaced-paragraph">
        You can use your ADA's voting power in governance-related decisions that shape how Cardano
        blockchain is run! You can also delegate your ADA's voting power and allow a DRep to vote on
        your behalf.
      </p>
      <p className="info-spaced-paragraph">
        To vote or to delegate your voting rights, you'll need to connect your wallet to{' '}
        <a href="https://gov.tools" target="_blank">
          gov.tools
        </a>{' '}
        - Cardano's governance portal.
      </p>
      <p className="info-spaced-paragraph">
        In order to receive staking rewards, you have to delegate your voting power to a DRep. On
        AdaLite, we handle this by automatically setting your delegation to "Always Abstain" when
        you make your first stake delegation or withdrawal request. If you wish to participate in
        Cardano Governance, please migrate to our Web3 wallet,{' '}
        <a
          href="https://chromewebstore.google.com/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca"
          target="_blank"
        >
          NuFi
        </a>
        , and then connect to{' '}
        <a href="https://gov.tools" target="_blank">
          gov.tools
        </a>{' '}
        (BitBox wallet support coming soon to NuFi!)
      </p>
    </div>
  )
}

export default GovernanceVotingCard
