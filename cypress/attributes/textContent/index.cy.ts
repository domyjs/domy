beforeEach(() => {
  cy.visit('cypress/attributes/textContent/index.html');
});

describe('textContent test', () => {
  it('Check the value of the state is inserted into the page', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });

  it('Check the value of the state is changed after the value is changed', () => {
    cy.get('button').click();
    cy.get('h1').should('have.text', 'Bye World!');
  });
});
