import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-once test', () => {
  it('Check the image src doesnt change', () => {
    cy.get('img')
      .invoke('attr', 'src')
      .then(src => {
        cy.get('button').click();
        cy.get('button').click();
        cy.get('button').click();
        cy.get('div').should('have.attr', 'data-img-src', src);
        cy.get('img').should('have.attr', 'src', src);
      });
  });
});
