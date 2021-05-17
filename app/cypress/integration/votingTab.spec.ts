/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Voting tab', () => {
  beforeEach('Navigates to Voting tab', () => {
    cy.dataCy('NavigationTabs')
      .contains('Voting')
      .click()
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
