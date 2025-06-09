import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-attrs test', () => {
  it('should have initial attributes for #attrs and #attrsRender', () => {
    cy.get('#attrs').should('have.attr', 'title', 'Hello');
    cy.get('#attrs').should('have.attr', 'name', 'test1');
    cy.get('#attrsRender').should('have.attr', 'style', 'color:red');
  });

  it('should update attrs when clicking on #attrsBtn', () => {
    cy.get('#attrsBtn').click();
    cy.get('#attrs').should('not.have.attr', 'title');
    cy.get('#attrs').should('have.attr', 'name', 'test2');
    cy.get('#attrs').should('have.attr', 'onclick');
  });

  it('should update attrsRender when clicking on #attrsRenderBtn', () => {
    cy.get('#attrsRenderBtn').click();
    cy.get('#attrsRender').should('not.have.attr', 'style', 'color: red;');
    cy.get('#attrsRender').should('have.attr', 'style', 'display: none;');
    cy.get('#attrsRender').should('have.attr', 'onclick');
  });

  it('should not render element if d-if condition is false', () => {
    cy.get('#attrsRenderBtn').click();
    cy.get('#attrsRender').should('not.be.visible');
  });
});
