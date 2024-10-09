import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('d-teleport test', () => {
  it('Should teleport the element to the specified target', () => {
    cy.get('body').find('h1').should('have.length', 1);
    cy.get('div').get('template').should('not.exist');
  });

  it('Should render the teleported element', () => {
    cy.get('h1').contains('Hello World!');
  });
});
