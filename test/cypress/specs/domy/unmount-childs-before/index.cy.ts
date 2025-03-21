import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Check it unmount childs before unmounting component so there is no last update', () => {
  it('should render the list of pages with correct titles', () => {
    cy.get('ul > li').should('have.length', 2);
    cy.get('ul > li').eq(0).should('contain', 'Home');
    cy.get('ul > li').eq(1).should('contain', 'About');
  });

  it('should render the Home component initially', () => {
    cy.get('p').should('exist');
    cy.get('p').should('contain', 'Home');
  });

  it('should hide Home but keep the same text', () => {
    cy.get('ul > li').contains('About').click();
    cy.get('div').should('have.class', 'transition-out');
    cy.get('p').should('exist');
    cy.get('p').should('contain', 'Home');
    cy.get('p').should('not.exist');

    cy.get('ul > li').contains('Home').click();
    cy.get('p').should('exist');
    cy.get('p').should('contain', 'Home');

    cy.get('ul > li').contains('About').click();
    cy.get('div').should('have.class', 'transition-out');
    cy.get('p').should('exist');
    cy.get('p').should('contain', 'Home');
    cy.get('p').should('not.exist');
  });
});
