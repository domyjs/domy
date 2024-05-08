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

describe('Plugin prioritise test', () => {
  it('Check d-before is executed before d-after', () => {
    cy.get('#prioritise').should('have.text', 'Hello World!');
  });
});
