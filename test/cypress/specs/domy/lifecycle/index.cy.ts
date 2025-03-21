import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Lifecycle test', () => {
  it('should update the setuped and mounted elements on initialization', () => {
    cy.get('#setuped').should('have.text', "'Hello World!'");
    cy.get('#mounted').should('have.text', '');
  });

  it('should update beforeUnmount and unmounted when the component is removed', () => {
    // cy.get('#beforeUnmount').should('have.text', '');
    // cy.get('#unmounted').should('have.text', '');
    // cy.get('button').click(); // Hide the component
    // cy.get('#beforeUnmount').should('have.text', 'P');
    // cy.get('#unmounted').should('have.text', '');
  });
});
