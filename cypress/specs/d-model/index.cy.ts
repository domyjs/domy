import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-model test', () => {
  it('Check attribute is removed', () => {
    cy.get('input').should('not.have.attr', 'd-model');
  });

  it('Check the default value is set', () => {
    cy.get('input').should('have.value', 'Hello World!');
    cy.get('p').should('have.text', 'Hello World!');
  });

  it('Check if the value change the notifier is triggered', () => {
    cy.get('input').type('Hello World!');
    cy.get('p').should('have.text', 'Hello World!Hello World!');
  });

  it('Check if the state change the value change', () => {
    cy.get('button').click();
    cy.get('input').should('have.value', 'Bye World!');
    cy.get('p').should('have.text', 'Bye World!');
  });
});
