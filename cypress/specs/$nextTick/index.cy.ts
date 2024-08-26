import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$nextTick functionality test', () => {
  it('checks that $nextTick waits for the DOM update', () => {
    // Access the browser window and create a spy for console.log
    cy.window().then(win => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    cy.get('#messageText').should('have.text', 'Say hi');
    cy.get('#updateMessage').click();

    cy.get('@consoleLog').should('have.been.calledWith', 'Say hi');

    cy.get('#messageText').should('have.text', 'Hello World!');

    cy.get('@consoleLog').should('have.been.calledWith', 'Hello World!');
  });
});
