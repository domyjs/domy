import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-cloak test', () => {
  it('Check the element is displayed after content setuped', () => {
    cy.get('main').should('have.attr', 'd-cloak');
    cy.get('main').should('have.css', 'display', 'none');
    cy.get('main').should('have.text', '{{ msg }}');

    cy.wait(2000);

    cy.get('main').should('not.have.attr', 'd-cloak');
    cy.get('main').should('not.have.css', 'display', 'none');
    cy.get('main').should('have.text', 'Hello World!');
  });
});
