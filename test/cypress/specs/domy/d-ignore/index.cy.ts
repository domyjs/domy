import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-ignore test', () => {
  it('Check the element is not rendered by domy', () => {
    cy.wait(1000);

    cy.get('div').should('not.have.attr', 'd-ignore');
    cy.get('div').should('have.attr', 'd-if');
    cy.get('p').should('have.text', '{{ msg }}');
    cy.get('component').should('exist');
  });
});
