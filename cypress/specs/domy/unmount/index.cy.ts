import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Unmount tests', () => {
  it('Should increment and decrement the count', () => {
    cy.get('#imbriqued').should('exist');
    cy.get('#count').should('contain', 'Count: 0');

    cy.get('#inc').click();
    cy.get('#count').should('contain', 'Count: 1');

    cy.get('#inc').click();
    cy.get('#count').should('contain', 'Count: 2');

    cy.get('#dec').click();
    cy.get('#count').should('contain', 'Count: 1');
  });

  it('Should show and hide the Count component', () => {
    cy.get('#count').should('exist');
    cy.get('#count').should('contain', 'Count: 0');
    cy.get('#inc').click();
    cy.get('#count').should('contain', 'Count: 1');

    cy.get('#show-hide').click();
    cy.get('#count').should('not.exist');

    cy.get('#show-hide').click();
    cy.get('#count').should('exist');
    cy.get('#count').should('contain', 'Count: 0');
  });

  it('Should update unmount count when the Count component is hidden', () => {
    cy.get('#unmount-count').should('contain', '0');

    cy.get('#show-hide').click();
    cy.get('#unmount-count').should('contain', '1');

    cy.get('#show-hide').click();
    cy.get('#show-hide').click();
    cy.get('#unmount-count').should('contain', '2');
  });

  it('Should update unmount events count when the Count component is unmounted', () => {
    cy.get('#unmount-events-count').should('contain', '0');

    cy.get('#show-hide').click();
    cy.get('#unmount-events-count').should('contain', '1');

    cy.get('#show-hide').click();
    cy.get('#show-hide').click();
    cy.get('#unmount-events-count').should('contain', '2');
  });
});
