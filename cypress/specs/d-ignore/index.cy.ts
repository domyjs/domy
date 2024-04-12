import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-ignore test', () => {
  it('Check the element is not rendered by domy', async () => {
    cy.get('div').should('have.attr', 'd-if');
    cy.get('p').should('have.text', '{{ msg }}');
  });
});
