beforeEach(() => {
  cy.visit('cypress/attributes/d-html/index.html');
});

describe('Attribute d-html test', () => {
  it('Check attribute is removed', () => {
    cy.get('h1').should('not.have.attr', 'd-html');
  });

  it('Check the value of the state is inserted into the page', () => {
    cy.get('h1').should('have.html', '<p>Hello World!</p>');
  });

  it('Check the value of the state is changed after the value is changed', () => {
    cy.get('button').click();
    cy.get('h1').should('have.html', '<p>Bye World!</p>');
  });
});
