import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-data test', () => {
  it('Check attribute is removed', () => {
    cy.get('main').should('not.have.attr', 'd-data');
  });

  it('Check the modal show', () => {
    cy.get('#modal').should('not.exist');
    cy.get('button').click();
    cy.get('#modal').should('exist');
    cy.get('button').click();
    cy.get('#modal').should('not.exist');
  });

  it('Check the data is only accessible in the scoped node', () => {
    cy.get('#err').should('have.text', '{{ showModal }}');
  });

  it('Check the data of the scoped node override the global data', () => {
    cy.get('#override').should('have.text', 'An other message');
    cy.get('#initialMsg').should('have.text', 'Hello World!');
  });

  it('Check the watcher are not called with scoped datas', () => {
    cy.get('button').click();
    cy.get('#watcherCalled').should('not.have.text', 'true');
  });
});
