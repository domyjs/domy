import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$setup-$mounted test', () => {
  it('Check the functions are call in the good order', () => {
    cy.get('h1').should('not.have.text', 'Rendering took: nullms');
  });
});
