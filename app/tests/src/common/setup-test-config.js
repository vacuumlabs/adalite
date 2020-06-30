const config = `{
  "ADALITE_SERVER_URL": "https://localhost:3000",
  "ADALITE_BLOCKCHAIN_EXPLORER_URL": "https://test-test.adalite.io",
  "ADALITE_DEFAULT_ADDRESS_COUNT": 10,
  "ADALITE_GAP_LIMIT": 20,
  "ADALITE_DEMO_WALLET_MNEMONIC": "quit gloom sell coil mosquito capital silk climb around fabric drink hood patient more whip",
  "ADALITE_ENABLE_DEBUGGING": false,
  "ADALITE_APP_VERSION": "3.7.0",
  "ADALITE_LOGOUT_AFTER": "900",
  "ADALITE_TREZOR_CONNECT_URL": "",
  "ADALITE_SUPPORT_EMAIL": "support@test.test",
  "ADALITE_FIXED_DONATION_VALUE": "40",
  "ADALITE_MIN_DONATION_VALUE": "1",
  "ADALITE_STAKE_POOL_ID": "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49733c37b8f6",
  "ADALITE_ENV": "local",
  "ADALITE_DEVEL_AUTO_LOGIN": "false",
  "ADALITE_CARDANO_VERSION": "byron"
}`

document.body.setAttribute('data-config', config)
