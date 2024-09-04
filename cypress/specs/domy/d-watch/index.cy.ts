import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-watch test', () => {
  it('Initializes with count and count2 set to 0', () => {
    cy.get('#count').should('contain', 'Count: 0');
    cy.get('#count2').should('contain', 'Count2: 0');
  });

  it('Increments and decrements count', () => {
    cy.get('#inc').click();
    cy.get('#count').should('contain', 'Count: 1');

    cy.get('#dec').click();
    cy.get('#count').should('contain', 'Count: 0');
  });

  it('Prevents count from going below 0', () => {
    cy.get('#dec').click();
    cy.get('#count').should('contain', 'Count: 0');
  });

  it('Prevent watch to access global data', () => {
    cy.get('#inc').click();
    cy.get('#count').should('contain', 'Count: 1');

    cy.get('#dec2').click();
    cy.get('#count2').should('contain', 'Count2: -1');
    cy.get('#count').should('contain', 'Count: 1');
  });
});
