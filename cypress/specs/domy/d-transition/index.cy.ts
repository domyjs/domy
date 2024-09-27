import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-transition test', () => {
  it('Check element not in dom', () => {
    cy.get('#if').should('not.exist');
    cy.get('#show').should('have.css', 'display', 'none');
    cy.get('#hello-world2').should('exist');
    cy.get('#init').should('exist');
    cy.get('#dynamic').should('not.exist');
  });

  it('Check the animation is apply on the differents elements', () => {
    cy.get('button').click();

    cy.get('#if').should('exist');
    cy.get('#show').should('have.css', 'display', 'flex');
    cy.get('#hello-world1').should('exist');

    cy.get('#if').should('have.class', 'transition-enter');
    cy.get('#show').should('have.class', 'transition-enter');
    cy.get('#hello-world1').should('have.class', 'transition-enter');

    cy.get('button').click();

    cy.get('#hello-world1').should('have.class', 'transition-out');
    cy.get('#hello-world2').should('have.class', 'transition-enter');
    cy.get('#if').should('have.class', 'transition-out');
    cy.get('#show').should('have.class', 'transition-out');

    cy.get('#hello-world1').should('not.exist');
    cy.get('#hello-world2').should('exist');
    cy.get('#if').should('not.exist');
    cy.get('#show').should('have.css', 'display', 'none');
  });

  it('Check the init modifier', () => {
    cy.get('#init').should('exist');
    cy.get('#init').should('have.class', 'transition-enter');

    cy.get('button').click();

    cy.get('#init').should('have.class', 'transition-out');
    cy.get('#init').should('not.exist');
  });

  it('Check the dynamic modifier', () => {
    cy.get('#dynamic').should('not.exist');

    cy.get('button').click();

    cy.get('#dynamic').should('exist');
    cy.get('#dynamic').should('have.class', 'transition-enter');

    cy.get('button').click();

    cy.get('#dynamic').should('have.class', 'op-transition-out');
    cy.get('#dynamic').should('not.exist');
  });
});
