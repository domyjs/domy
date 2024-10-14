import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$nextTick functionality test', () => {
  it('checks that $nextTick waits for the DOM update', () => {
    cy.get('#messageText').should('have.text', 'Say hi');
    cy.get('#updateMessage').click();

    cy.get('#checkNextTick').should('have.been.calledWith', 'Say hi');

    cy.get('#messageText').should('have.text', 'Hello World!');

    cy.get('#checkNextTick').should('have.been.calledWith', 'Hello World!');
  });
});
