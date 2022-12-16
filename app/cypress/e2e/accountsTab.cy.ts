/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Account tab', () => {
  beforeEach('Navigates to Account tab', () => {
    cy.dataCy('NavigationTabs')
      .contains('Account ')
      .click()
  })

  it('Validates initial state of accounts tab', () => {
    cy.contains('Wallet available balance').should('be.visible')
    cy.contains('Wallet rewards balance').should('be.visible')
    cy.dataCy('AccountsBalanceSum')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 5)

    // the testing wallet should have at least two accounts
    cy.dataCy('AccountTile')
      .as('AccountTiles')
      .its('length')
      .should('be.gt', 2)

    cy.get('@AccountTiles')
      .first()
      .as('FirstAccountTile')
      .contains('Account #1')

    // first tile contains required fields
    cy.get('@FirstAccountTile')
      .contains('Available balance')
      .should('be.visible')
    cy.get('@FirstAccountTile')
      .contains('Rewards balance')
      .should('be.visible')
    cy.get('@FirstAccountTile')
      .contains('Delegation')
      .should('be.visible')

    // initial state of buttons of the first tile
    cy.get('@FirstAccountTile').within(() => {
      cy.dataCy('AccountTileTransferBtn')
        .should('be.visible')
        .and('be.disabled')
      cy.dataCy('AccountTileDelegateBtn')
        .should('be.visible')
        .and('be.enabled')
      cy.dataCy('AccountTileActivateBtn')
        .should('be.visible')
        .and('be.disabled')
    })

    cy.get('@AccountTiles')
      .eq(1) // second tile
      .as('SecondAccountTile')
      .contains('Account #2')
    // initial state of buttons of the first tile
    cy.get('@SecondAccountTile').within(() => {
      cy.dataCy('AccountTileTransferBtn')
        .should('be.visible')
        .and('be.enabled')
      cy.dataCy('AccountTileDelegateBtn')
        .should('be.visible')
        .and('be.enabled')
      cy.dataCy('AccountTileActivateBtn')
        .should('be.visible')
        .and('be.enabled')
    })
  })

  it('Delegates from an account', () => {
    const poolId = '48f2c367cfe81cac6687c3f7c26613edfe73cd329402aa5cf493bb61'

    cy.dataCy('AccountTile')
      .first()
      .within(() => {
        cy.dataCy('AccountTileDelegateBtn')
          // right now there are 2 stacked delegate buttons, so filter the visible one
          .filter(':visible')
          .should('be.visible')
          .and('be.enabled')
          .click()
      })

    cy.contains('Delegate Account #1 Stake').should('be.visible')

    cy.dataCy('PoolDelegationTextField')
      .should('be.visible')
      .clear()
      .type(poolId)

    cy.dataCy('DelegateButton')
      .as('ModalDelegateButton')
      .should('be.enabled')
    cy.dataCy('DelegateFeeAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 0.1)
    cy.get('@ModalDelegateButton').click()

    cy.contains('Delegation review').should('be.visible')
    // .contains could find the underlying pool ID, therefore filter the visible one
    cy.findAllByText(poolId)
      .filter(':visible')
      .should('be.visible')
    cy.contains('Confirm Transaction').click()

    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet...').should('be.visible')
    cy.contains('Reloading wallet...').should('not.exist')
  })

  it('Activates second account', () => {
    cy.dataCy('AccountTile')
      .eq(1) // second tile
      .as('SecondAccountTile')
      .within(() => {
        cy.dataCy('AccountTileActivateBtn').click()

        // initial state of the active tile
        cy.dataCy('AccountTileTransferBtn')
          .should('be.visible')
          .and('be.disabled')
        cy.dataCy('AccountTileDelegateBtn')
          .should('be.visible')
          .and('be.enabled')
        cy.dataCy('AccountTileActivateBtn')
          .should('be.visible')
          .and('be.disabled')
      })
  })

  it('Transfers funds between two accounts', () => {
    cy.dataCy('AccountTile')
      .eq(1) // second tile
      .as('SecondAccountTile')
      .within(() => {
        // right now there are 2 stacked delegate buttons, so filter the visible one
        cy.dataCy('AccountTileTransferBtn')
          .filter(':visible')
          .click()
      })
    cy.contains('Transfer funds between accounts').should('be.visible')
    cy.dataCy('AccountSwitch')
      .should('be.visible')
      .within(() => {
        cy.dataCy('AccountDropdownButton')
          .as('AccountDropdownButtons')
          // should have From and To dropdown buttons
          .its('length')
          .should('equal', 2)

        // check first dropdown, select first
        cy.get('@AccountDropdownButtons')
          .first()
          .click()
        cy.dataCy('AccountDropdownItem')
          .filter(':visible')
          .as('FromDropdownAccountItems')
          .its('length')
          .should('equal', 3)
        cy.get('@FromDropdownAccountItems')
          .first()
          .click()

        // check second dropdown, select third
        cy.get('@AccountDropdownButtons')
          .eq(1)
          .click()
        cy.dataCy('AccountDropdownItem')
          .filter(':visible')
          .as('ToDropdownAccountItems')
          .its('length')
          .should('equal', 3)
        cy.get('@ToDropdownAccountItems')
          .eq(2)
          .click()
      })

    cy.contains('Max').should('be.enabled')
    cy.dataCy('AccountSendAmountField').type('50')
    cy.contains('Calculating fee...')
    cy.dataCy('SendButton')
      .as('AccountSendButton')
      .should('be.enabled')

    cy.dataCy('SendFeeAmount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 0.1)

    cy.get('@AccountSendButton').click()

    cy.contains('Transaction between accounts review').should('be.visible')
    cy.contains('Confirm Transaction').click()
    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet...').should('be.visible')
    cy.contains('Reloading wallet...').should('not.exist')
  })
})
