import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-transition test', () => {
  it('Check element not in dom', () => {
    cy.get('#if').should('not.exist');
    cy.get('#show').should('have.css', 'display', 'none');
  });

  it('Check the element is display/removed after a click and the animation is apply', () => {
    cy.get('button').click();

    cy.get('#if').should('exist');
    cy.get('#show').should('have.css', 'display', 'flex');
    cy.get('div').should('have.class', 'transition-enter');

    cy.get('button').click();

    cy.get('div').should('have.class', 'transition-out');
    cy.get('#if').should('not.exist');
    cy.get('#show').should('have.css', 'display', 'none');
  });
});
