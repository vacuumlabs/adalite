// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// run before each test in each file
beforeEach('Logs in via UI', () => {
  const mnemonic =
    'bounce tissue tent monitor educate book neglect install armed note explain country maximum strike search'
  cy.visit('/')
  cy.contains('Welcome to AdaLite wallet')
  cy.contains('Continue to AdaLite').click()
  cy.contains('Mnemonic').click()
  cy.contains('Unlock')
    .should('be.visible')
    .should('be.disabled')
  cy.dataCy('MnemonicTextField')
    .should('be.empty')
    .type(mnemonic)
    .should('have.value', mnemonic)
  cy.contains('Unlock').click()
  cy.url().should('include', '/txHistory')
  cy.contains('AdaLite News')
  cy.contains('Close').click()
})

beforeEach('Lands on sending page in a valid wallet', () => {
  cy.contains('Available balance')
  cy.dataCy('SendBalanceAmount')
    .invoke('text')
    .then(parseFloat)
    .should('be.gt', 5)
  cy.dataCy('SendButton')
    .as('SendButton')
    .should('be.visible')
    .should('be.disabled')
  cy.contains('Max')
    .as('MaxButton')
    .should('be.visible')
    .should('be.disabled')
})
