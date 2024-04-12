import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$nextTick test', () => {
  it('Check nextTick wait dependencie update', () => {
    cy.get('button').should('have.text', 'Say hi');
    cy.get('button').click();
    cy.get('@consoleLog').should('have.been.calledWith', 'Say hi');
    cy.get('button').should('have.text', 'Hello World!');
    cy.get('@consoleLog').should('have.been.calledWith', 'Hello World!');
  });
});
