import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Binding test', () => {
  it('Check the attributes are removed', () => {
    cy.get('h1').should('not.have.attr', ':style');
    cy.get('h1').should('not.have.attr', ':id');
  });

  it('Check the value is correct', () => {
    cy.get('h1').should('have.attr', 'id', '0');
    cy.get('h1').should('have.css', 'backgroundColor', 'rgb(255, 0, 0)');
  });

  it('Check the value are updated', () => {
    cy.get('#simple').click();
    cy.get('h1').should('have.attr', 'id', '1');
    cy.get('h1').should('have.css', 'backgroundColor', 'rgb(0, 128, 0)');
  });
});

describe('Binding class test', () => {
  it('Check if the element has red text and blue background', () => {
    cy.get('#class').should('have.class', 'red').and('have.class', 'bg-blue');
    cy.get('#class2').should('have.class', 'red').and('have.class', 'bg-blue');
  });

  it('Check the class is updating', () => {
    // Trigger updates to classes
    cy.get('#class-btn').click();
    cy.get('#class2-btn').click();

    // Verify classes after update
    cy.get('#class').should('have.class', 'red').and('not.have.class', 'bg-blue');
    cy.get('#class2').should('have.class', 'red').and('not.have.class', 'bg-blue');
  });
});

describe('Binding style test', () => {
  it('Check if the element has red text and blue background', () => {
    // Check initial CSS properties
    cy.get('#style').should('have.css', 'color', 'rgb(255, 0, 0)'); // CSS color values are often returned in RGB format
    cy.get('#style').should('have.css', 'background-color', 'rgb(0, 0, 255)');
  });

  it('Check the style is updating', () => {
    // Trigger style changes
    cy.get('#style-btn').click();

    // Verify CSS changes
    cy.get('#style').should('have.css', 'color', 'rgb(255, 0, 0)');
    cy.get('#style').should('not.have.css', 'background-color', 'rgb(0, 0, 255)');
  });
});
