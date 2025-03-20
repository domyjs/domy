import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Store test', () => {
  it('Vérifie que le compteur démarre à 0', () => {
    cy.get('h1').should('contain', '0');
    cy.get('p').should('contain', '0');
  });

  it('Incrémente le compteur au clic sur +', () => {
    cy.get('#increment').click();
    cy.get('h1').should('contain', '1');
    cy.get('p').should('contain', '1');
  });

  it('Décrémente le compteur au clic sur -', () => {
    cy.get('#increment').click().click(); // Compteur à 2
    cy.get('#decrement').click(); // Retour à 1
    cy.get('h1').should('contain', '1');
    cy.get('p').should('contain', '1');
  });

  it('Gère plusieurs clics sur + et - correctement', () => {
    cy.get('#increment').click().click(); // +2
    cy.get('#decrement').click(); // -1
    cy.get('#increment').click(); // +1
    cy.get('h1').should('contain', '2');
    cy.get('p').should('contain', '2');
  });
});
