import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$nextTick test', () => {
  it('Check nextTick wait dependencie update', () => {
    cy.window().then(win => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    cy.get('button p').should('have.text', 'Say hi');
    cy.get('button').click();
    cy.get('@consoleLog').should('have.been.calledWith', 'Say hi');
    cy.get('button p').should('have.text', 'Hello World!');
    cy.get('@consoleLog').should('have.been.calledWith', 'Hello World!');
  });
});
