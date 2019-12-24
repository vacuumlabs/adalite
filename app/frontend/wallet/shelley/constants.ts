export const itnConfig = {
  block0Hash: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
  block0Time: '2019-12-13T19:13:37+00:00',
  blockContentMaxSize: 1024000,
  consensusVersion: 'genesis',
  currSlotStartTime: '2019-12-22T10:31:36+00:00',
  epochStabilityDepth: 10,
  fees: {
    certificate: 10000,
    coefficient: 100000,
    constant: 200000,
    per_certificate_fees: {
      certificate_pool_registration: 500000000,
      certificate_stake_delegation: 400000,
    },
  },
  rewardParams: {
    compoundingRatio: {
      denominator: 1,
      numerator: 0,
    },
    compoundingType: 'Linear',
    epochRate: 1,
    epochStart: 1,
    initialValue: 3835616440000,
    poolParticipationCapping: [100, 100],
    rewardDrawingLimitMax: {
      ByStakeAbsolute: {
        denominator: 10000000000,
        numerator: 4109589,
      },
    },
  },
  slotDuration: 2,
  slotsPerEpoch: 43200,
  treasuryTax: {
    fixed: 0,
    ratio: {
      denominator: 10,
      numerator: 1,
    },
  },
}
