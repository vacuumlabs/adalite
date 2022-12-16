import {defineConfig} from 'cypress'

export default defineConfig({
  viewportWidth: 1440,
  viewportHeight: 900,
  defaultCommandTimeout: 25000,
  modifyObstructiveCode: false,
  retries: {
    runMode: 7,
    openMode: 7,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config)
    },
    baseUrl: 'https://localhost:3000',
  },
})
