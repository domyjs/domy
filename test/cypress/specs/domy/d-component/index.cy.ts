import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('d-component test', () => {
  it('should render the list of pages with correct titles', () => {
    cy.get('ul > li').should('have.length', 3);
    cy.get('ul > li').eq(0).should('contain', 'Home');
    cy.get('ul > li').eq(1).should('contain', 'About');
    cy.get('ul > li').eq(2).should('contain', 'Not Exist');
  });

  it('should render the Home component initially', () => {
    cy.get('button').click();
    cy.get('button').click();
    cy.get('button').click();

    cy.get('#home').should('exist');
    cy.get('#home').should('contain', 'Page: Home');
  });

  it('should switch to the About component when About is clicked', () => {
    cy.get('button').click();
    cy.get('button').click();
    cy.get('button').click();

    cy.get('ul > li').contains('About').click();
    cy.get('#home').should('not.exist');
    cy.get('#about').should('exist').and('contain', 'Page: About');
  });

  it('should not render any component when Not Exist is clicked', () => {
    cy.get('button').click();
    cy.get('button').click();
    cy.get('button').click();
    cy.get('ul > li').contains('Not Exist').click();
    cy.get('#home').should('not.exist');
    cy.get('#about').should('not.exist');
    cy.get('body').should('have.length', 1);
  });
});
