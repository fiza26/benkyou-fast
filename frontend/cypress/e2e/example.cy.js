// https://on.cypress.io/api

describe('My First Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('span', '11')
    cy.contains('span', '30')
    cy.contains('span', '#5')

    cy.get('.card-container').first().within(() => {
      cy.contains('button', 'Learn >').click()
    })

    Array(50).fill().forEach(() => {
      cy.contains('button', 'Next >').click()
    })

    cy.get('.achievement-content').should('be.visible').within(() => {
      cy.contains('button', 'Okay').click()
    })

    Array(50).fill().forEach(() => {
      cy.contains('button', 'Next >').click()
    })

    cy.get('.achievement-content').should('be.visible').within(() => {
      cy.contains('button', 'Okay').click()
    })

    Array(200).fill().forEach(() => {
      cy.contains('button', 'Next >').click()
    })

    cy.get('.achievement-content').should('be.visible').within(() => {
      cy.contains('button', 'Okay').click()
    })

    Array(700).fill().forEach(() => {
      cy.contains('button', 'Next >').click()
    })

  })
})
