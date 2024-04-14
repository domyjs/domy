import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('modifiers test', () => {
  it('Once: Check the value change one time', () => {
    cy.get('h1').should('have.text', 'Count: 0');
    cy.get('#once button').click();
    cy.get('h1').should('have.text', 'Count: 1');
    cy.get('#once button').click();
    cy.get('h1').should('have.text', 'Count: 1');
  });

  it('Keydown ENTER: Check the event is triggered only if enter pressed', () => {
    cy.get('h2').should('have.text', 'Username: ');
    cy.get('#enter input').type('Yoann');
    cy.get('h2').should('have.text', 'Username: ');
    cy.get('#enter input').type('{enter}');
    cy.get('h2').should('have.text', 'Username: Yoann');

    cy.get('#enter input').type('Pierre');
    cy.get('h2').should('have.text', 'Username: Yoann');
    cy.get('#enter input').type('+');
    cy.get('h2').should('have.text', 'Username: Pierre');
  });

  it('Click away: Check the event is triggered only if a click is made away from the element', () => {
    cy.get('modal').should('not.exist');

    cy.get('#away button').click();
    cy.get('modal').should('exist');

    cy.get('modal p').click();
    cy.get('modal').click();
    cy.get('modal').should('exist');

    cy.get('body').click();
    cy.get('modal').should('not.exist');
  });
});
