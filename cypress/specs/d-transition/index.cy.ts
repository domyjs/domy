import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-transition test', () => {
  it('Check element not in dom', () => {
    cy.get('div').should('not.exist');
  });

  it('Check the element is display/removed after a click and the animation is apply', () => {
    cy.get('button').click();
    cy.get('div').should('exist');
    cy.get('div').should('have.class', 'transition-enter');

    cy.get('button').click();
    cy.get('div').should('have.class', 'transition-out');
    cy.get('div').should('not.exist');
  });
});
