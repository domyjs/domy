import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Collapse test', () => {
  it('Check the setting attribute is removed', () => {
    // Check settings attribute is removed
    cy.get('#c2').should('not.have.attr', 'd-collapse-settings');
    cy.get('#c3').should('not.have.attr', 'd-collapse-settings');
  });

  it('should initially show all content', () => {
    // Assert that content is not collapsed initially
    cy.get('#c1').should('not.be.visible');
    cy.get('#c2').should('be.visible'); // We have a default height so we can see 10px of it
    cy.get('#c2').should('have.css', 'height', '10px');
    cy.get('#c3').should('not.be.visible');
  });

  it('should collapse and expand the content on button click', () => {
    // Click to collapse content
    cy.get('button').click();

    // Check that content is collapsed
    cy.get('#c1').should('be.visible');
    cy.get('#c2').should('be.visible');
    cy.get('#c2').should('not.have.css', 'height', '10px');
    cy.get('#c3').should('have.css', 'height', '100px'); // height 100 for c3

    // Click again to expand content
    cy.get('button').click();

    // Check that content is expanded again
    cy.get('#c1').should('not.be.visible');
    cy.get('#c2').should('have.css', 'height', '10px');
    cy.get('#c3').should('not.be.visible');
  });
});
