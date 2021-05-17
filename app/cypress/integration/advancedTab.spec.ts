/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Advanced tab', () => {
  beforeEach('Navigates to Advanced tab', () => {
    cy.dataCy('NavigationTabs')
      .contains('Advanced')
      .click()
  })

  it('Validates initial state of advanced tab', () => {
    const stakeKey =
      '5820cc7e0419019350edf809d8f4b2cad4d982ef7d158143086fe74cd78808704722'

    cy.dataCy('AdvancedKeyCard').should('be.visible')
    cy.dataCy('PoolRegistrationCard').should('be.visible')
    // disabled for mnemonic users
    cy.contains('Select a transaction file').should('be.visible')
    cy.dataCy('AdvancedSignButton')
      .should('be.visible')
      .and('be.disabled')
    cy.dataCy('AdvancedDownloadSignatureButton')
      .should('be.visible')
      .and('be.disabled')

    cy.dataCy('DownloadStakeKey')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'data:application/json')
      .and('include', 'cborHex')
      .and('include', stakeKey)
      .and('include', 'type')
      .and('include', 'StakeVerificationKeyShelley_ed25519')
  })
})
