import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$nextTick-scope functionality test', () => {
  it('checks that $nextTick waits for the DOM update', () => {
    cy.get('#messageText').should('have.text', 'Before');
    cy.get('#updateMessage').click();

    cy.get('#before').should('have.text', 'Before');

    cy.get('#messageText').should('have.text', 'After');

    cy.get('#after').should('have.text', 'After');
  });
});
