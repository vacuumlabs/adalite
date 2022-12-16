/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

/* eslint-disable prefer-arrow-callback */
describe('Sending tab', () => {
  it('Sends a valid transaction', () => {
    const sendAddress =
      'addr_test1qqv3z933r88vnpgvqtwfcskw3uxg6up5n090pg330m25ke7rwgtphv6x8j32g8clqv59adsk78sgtljveyjejjt0fj6q3lwdrw'
    const sendAmount = '50'

    cy.dataCy('AddressTextField').type(sendAddress)
    cy.get('@MaxButton').should('be.enabled')

    cy.dataCy('SendAmountField')
      .type(sendAmount)
      .should('have.value', sendAmount)
    cy.contains('Calculating fee...')

    cy.get('@SendButton').should('be.enabled')

    cy.dataCy('SendFeeAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('FeeAmount')
      .should('be.gt', 0.1)

    cy.get('@SendButton').click()
    cy.contains('Transaction review').should('be.visible')
    cy.contains(sendAddress).should('be.visible')
    // total amount should be higher than the sent amount
    cy.dataCy('SendAmountTotal')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', parseFloat(sendAmount))

    cy.contains('Confirm Transaction').click()
    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet...').should('be.visible')
    cy.contains('Transaction successful!').should('be.visible')
  })

  it('Validates sending form', () => {
    const sendAddress =
      'addr_test1qqv3z933r88vnpgvqtwfcskw3uxg6up5n090pg330m25ke7rwgtphv6x8j32g8clqv59adsk78sgtljveyjejjt0fj6q3lwdrw'

    // incomplete address
    cy.dataCy('AddressTextField').type(sendAddress.substr(0, 5))

    cy.get('@MaxButton').should('be.disabled')
    cy.get('@SendButton').should('be.disabled')

    cy.dataCy('SendFeeAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should('be.eq', 0)

    // now a valid complete address
    cy.contains('Invalid address').should('be.visible')
    cy.dataCy('AddressTextField').type(sendAddress.substr(5))
    cy.contains('Invalid address').should('not.exist')

    cy.get('@MaxButton').should('be.enabled')
    cy.get('@SendButton').should('be.disabled')

    // amount error checks
    cy.dataCy('SendAmountField').type('-1')
    cy.contains('Amount has to be a positive number').should('be.visible')

    cy.dataCy('SendAmountField')
      .clear()
      .type('0')
    cy.contains('Amount has to be a positive number').should('be.visible')

    cy.dataCy('SendAmountField')
      .clear()
      .type('0.1')
    cy.contains('Amount too low').should('be.visible')
  })

  it('Sends a valid asset transaction', () => {
    const sendAddress =
      'addr_test1qqv3z933r88vnpgvqtwfcskw3uxg6up5n090pg330m25ke7rwgtphv6x8j32g8clqv59adsk78sgtljveyjejjt0fj6q3lwdrw'
    cy.dataCy('AddressTextField').type(sendAddress)
    cy.contains('Invalid address').should('not.exist')

    cy.dataCy('SendAssetDropdown').click()
    cy.dataCy('SendAssetDropdownTokenItem')
      .first()
      .as('TokenItem')
      .dataCy('SendAssetTokenQuantity')
      .first()
      .invoke('text')
      .as('TokenQuantity')

    cy.get('@TokenItem').click()
    cy.get('@MaxButton').click()
    cy.contains('Calculating fee...').should('be.visible')
    cy.get('@SendButton').should('be.enabled')

    cy.dataCy('SendFeeAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('FeeAmount')
      .should('be.gt', 0.1)

    cy.dataCy('SendAssetMinAdaAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('MinAmount')
      .should('be.gt', 1)

    cy.get('@SendButton').click()
    cy.contains('Transaction review').should('be.visible')
    cy.contains(sendAddress).should('be.visible')
    // confirm token amount is the equals the previously selected token amount
    cy.dataCy('SendTokenAmount')
      .should('be.visible')
      .invoke('text')
      .should(function($tokenAmount) {
        expect($tokenAmount).to.eq(this.TokenQuantity)
      })

    cy.dataCy('SendAmountTotal')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 1)

    cy.contains('Confirm Transaction').click()
    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet...').should('be.visible')
    cy.contains('Transaction successful!').should('be.visible')
  })
})
