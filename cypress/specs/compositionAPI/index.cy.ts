import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('methods test', () => {
  it('Check we can access helpers in mounted', () => {
    // Check the dispatch helper is called
    cy.get('#count1 h1').should('have.text', '1');
    cy.get('#count2 h1').should('have.text', '1');
  });

  it('Check the value update and the correct value is updated in the correct domy instance', () => {
    cy.get('#count1 h1').should('have.text', '1');
    cy.get('#count2 h1').should('have.text', '1');

    cy.get('#count1 #dec').click();
    cy.get('#count1 h1').should('have.text', '0');
    cy.get('#count2 h1').should('have.text', '1');

    cy.get('#count1 #dec').click();
    cy.get('#count1 h1').should('have.text', '0');
    cy.get('#count2 h1').should('have.text', '1');

    cy.get('#count2 #inc').click();
    cy.get('#count1 h1').should('have.text', '0');
    cy.get('#count2 h1').should('have.text', '2');
  });
});
