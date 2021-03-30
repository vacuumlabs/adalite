/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Staking tab', () => {
  beforeEach('Navigates to Staking tab', () => {
    cy.dataCy('NavigationTabs')
      .contains('Staking')
      .click()

    cy.contains('Staking balance').should('be.visible')
    cy.contains('Current Delegation').should('be.visible')
    cy.contains('Staking and Rewards History').should('be.visible')
    cy.contains('Delegate Stake')
      .as('DelegateAccordion')
      .should('be.visible')

    // expand delegation card if it is hidden
    cy.dataCy('DelegateButton')
      .as('DelegateButton')
      .then(($button) => {
        // @ts-ignore: Is exists for a jquery button
        if (!$button.is(':visible')) {
          cy.get('@DelegateAccordion').click()
        }
      })
  })

  it('Delegate to a valid pool', () => {
    const poolId = '48f2c367cfe81cac6687c3f7c26613edfe73cd329402aa5cf493bb61'
    cy.dataCy('PoolDelegationTextField')
      .should('be.visible')
      .clear()
      .type(poolId)

    cy.get('@DelegateButton').should('be.enabled')
    cy.dataCy('DelegateFeeAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('FeeAmount')
      .should('be.gt', 0.1)
    cy.get('@DelegateButton').click()

    cy.contains('Delegation review').should('be.visible')
    cy.contains(poolId).should('be.visible')
    cy.contains('Confirm Transaction').click()

    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet info...').should('be.visible')
    cy.contains('Reloading wallet info...').should('not.exist')
  })

  it('Validate invalid stake pool id', () => {
    const poolId = 'invalid_id'
    cy.dataCy('PoolDelegationTextField')
      .should('be.visible')
      .clear()
      .type(poolId)

    cy.contains('Enter a valid stakepool id.').should('be.visible')
    cy.get('@DelegateButton')
      .should('be.disabled')
      .and('be.visible')
  })
})
