import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-show test', () => {
  it('Check attribute is removed', () => {
    cy.get('#modal').should('not.have.attr', 'd-show');
  });

  it('Check if the modal is not show', () => {
    cy.get('#inside-modal').should('have.css', 'display', 'none');
    cy.get('#modal').should('have.css', 'display', 'none');
  });

  it('Check we can show/hide the modal', () => {
    cy.get('button').click();

    cy.get('#inside-modal').should('have.css', 'display', 'flex');
    cy.get('#modal').should('have.css', 'display', 'flex');

    cy.get('button').click();

    cy.get('#inside-modal').should('have.css', 'display', 'none');
    cy.get('#modal').should('have.css', 'display', 'none');
  });
});
