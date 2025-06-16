import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Collapse test', () => {
  it('Check the setting attribute is removed', () => {
    // Check settings attribute is removed
    cy.get('#c2').should('not.have.attr', 'd-collapse-settings');
  });

  it('should initially show all content', () => {
    // Assert that content is not collapsed initially
    cy.get('#c1').should('have.css', 'height', '10px');
    cy.get('#c2').should('be.visible'); // We have a default height so we can see 10px of it
    cy.get('#c2').should('have.css', 'height', '20px');
  });

  it('should collapse and expand the content on button click', () => {
    // Click to collapse content
    cy.get('button').click();

    // Check that content is expanded
    cy.get('#c1').should('be.visible');
    cy.get('#c2').should('be.visible');

    cy.get('#c2').should('not.have.css', 'height', '20px');
    cy.get('#c2').should('have.css', 'transition').and('include', 'height 0.5s ease-in');

    // cy.get('#c1').should('have.attr', 'style').and('contain', 'height: auto');
    // cy.get('#c2').should('have.attr', 'style').and('contain', 'height: auto');

    // Click again collapse
    cy.get('button').click();

    // Check that content is expanded again
    cy.get('#c1').should('have.css', 'height', '10px');
    cy.get('#c2').should('have.css', 'height', '20px');
  });
});
