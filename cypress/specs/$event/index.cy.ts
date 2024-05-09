import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$event test', () => {
  it('Check we have $event present into @event', () => {
    cy.get('h1').should('have.text', '');
    cy.get('button').click();
    cy.get('h1').should('have.text', 'click');
  });
});
