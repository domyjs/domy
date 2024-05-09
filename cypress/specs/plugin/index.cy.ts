import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Plugin directive test', () => {
  it('Check the text is in uppercase', () => {
    cy.get('#uppercase').should('have.text', 'HELLO WORLD!');
  });
});

describe('Plugin helper test', () => {
  it('Check $sayHello give "Hello World!"', () => {
    cy.get('#helper').should('have.text', 'Hello World!');
  });
});

describe('Plugin prefix test', () => {
  it('Check the prefix add a click listener', () => {
    cy.get('#prefix').should('not.have.attr', 'd-click:class');
    cy.get('#prefix').should('have.class', '');
    cy.get('#prefix').click();
    cy.get('#prefix').should('have.class', 'red');
  });
});

describe('Plugin prioritise test', () => {
  it('Check d-before is executed before d-after', () => {
    cy.get('#prioritise').should('have.text', 'Hello World!');
  });
});
