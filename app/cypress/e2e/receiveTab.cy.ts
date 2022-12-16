/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Receive tab', () => {
  beforeEach('Navigates to Receive tab', () => {
    cy.dataCy('NavigationTabs')
      .contains('Receive')
      .click()
  })

  it('Validate receive tab addresses', () => {
    cy.contains('My Addresses')
    // first is shown,
    cy.dataCy('ReceiveAddressItem')
      .as('AddressItems')
      .should('have.length', 20)
      .first()
      .contains('Copy Address')
      .should('be.visible')
      .click()

    // second is hidden
    cy.get('@AddressItems')
      .eq(1)
      .contains('Copy Address')
      .should('not.be.visible')

    // expand second address
    cy.dataCy('ReceiveAddressAccordion')
      .eq(1)
      .click()

    // first is hidden,
    cy.get('@AddressItems')
      .eq(0)
      .contains('Copy Address')
      .should('not.be.visible')

    // second is shown
    cy.get('@AddressItems')
      .eq(1)
      .contains('Copy Address')
      .should('be.visible')
  })
})
