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

  /* eslint-disable prefer-arrow-callback */
  it('Registers a catalyst voting key', () => {
    const PIN = '7777'
    const WRONG_PIN = '7778'

    // lands on first step
    cy.dataCy('VotingCard').should('be.visible')
    cy.dataCy('VotingRegisterBtn')
      .should('be.visible')
      .and('be.enabled')
      .click()
    cy.contains('Voting Registration').should('be.visible')

    // types in wrong pin
    cy.dataCy('VotingFirstPin')
      .type(PIN)
      .should('have.value', PIN)
    cy.dataCy('VotingSecondPin')
      .as('VotingSecondPinInput')
      .type(WRONG_PIN)
      .should('have.value', WRONG_PIN)
    cy.dataCy('VotingErrorMessage').should('be.visible')
    cy.dataCy('VotingBottomPreviousBtn')
      .should('be.visible')
      .and('be.enabled')
    cy.dataCy('VotingBottomNextBtn')
      .should('be.visible')
      .and('be.disabled')

    // resets confirm pin and types correct pin
    cy.get('@VotingSecondPinInput')
      .clear()
      .type(PIN)
      .should('have.value', PIN)
    cy.dataCy('VotingErrorMessage').should('not.exist')
    cy.dataCy('VotingBottomPreviousBtn')
      .should('be.visible')
      .and('be.enabled')
    cy.dataCy('VotingBottomNextBtn')
      .should('be.visible')
      .and('be.enabled')
      .click()

    // lands on second step, clicks review tx
    cy.dataCy('VotingBottomPreviousBtn')
      .should('be.visible')
      .and('be.enabled')
    cy.dataCy('VotingBottomNextBtn')
      .should('be.visible')
      .and('be.disabled')
    cy.dataCy('VotingReviewTransactionBtn')
      .should('be.visible')
      .and('be.enabled')
      .click()
    cy.contains('Preparing transaction...').should('be.visible')

    // confirmation modal opens
    cy.contains('Voting registration review').should('be.visible')
    cy.contains('Reward address').should('be.visible')
    cy.contains('Voting key').should('be.visible')

    // checks equality of fee and total amounts
    cy.dataCy('VotingFeeAmount')
      .should('be.visible')
      .invoke('text')
      .as('FeeAmount')
      .then(parseFloat)
      .should('be.gt', 0.1)

    cy.dataCy('VotingTotalAmount')
      .should('be.visible')
      .invoke('text')
      .should(function($totalAmount) {
        expect($totalAmount).to.eq(this.FeeAmount)
      })

    // sends tx
    cy.dataCy('ConfirmTransactionBtn').click()
    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet info...').should('be.visible')
    cy.contains('Transaction successful!').should('be.visible')

    cy.dataCy('VotingReviewTransactionBtn')
      .should('be.visible')
      .and('be.disabled')

    // goes to third step
    cy.dataCy('VotingBottomNextBtn')
      .should('be.visible')
      .and('be.enabled')
      .click()

    // lands on QR code step
    cy.dataCy('VotingQRCode').should('be.visible')
    cy.dataCy('VotingBottomPreviousBtn')
      .should('be.visible')
      .and('be.enabled')
    cy.dataCy('VotingBottomNextBtn')
      .should('be.visible')
      .and('be.enabled')

    // tries to go back and forward again
    cy.dataCy('VotingBottomPreviousBtn').click()
    cy.contains('Transaction successful!').should('be.visible')
    cy.dataCy('VotingBottomNextBtn').click()

    // finishes
    cy.dataCy('VotingBottomNextBtn').click()
  })
})
