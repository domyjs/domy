import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-mounted test', () => {
  it('Check attribute is removed', () => {
    cy.get('div').should('not.have.attr', 'd-mounted');
  });

  it('Check mount function change the element content', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });

  it('Check the d-for is fully rendered before d-mounted', () => {
    cy.get('ul').get('li').should('have.length', 1);
    cy.get('ul').get('li').should('have.text', '{{ text }}');
  });
});
