export enum UnexpectedErrorReason {
  UnsupportedOperationError = 'UnsupportedOperationError',
  ParamsValidationError = 'ParamsValidationError',
  InvalidCertificateType = 'InvalidCertificateType',
  AccountExplorationError = 'AccountExplorationError',
  BulkExportCreationError = 'BulkExportCreationError',
  InvalidTxPlanType = 'InvalidTxPlanType',
  InvalidRelayType = 'InvalidRelayType',
  CannotConstructTxPlan = 'CannotConstructTxPlan',
  ByronWitnessesMissingChainCode = 'ByronWitnessesMissingChainCode',
  MissingStakingPath = 'MissingStakingPath',
  MissingStakingXpub = 'MissingStakingXpub',
}
