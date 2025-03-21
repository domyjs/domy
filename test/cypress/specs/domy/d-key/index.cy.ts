import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-key test', () => {
  it('Check we render correctly the list', () => {
    // Vérifie qu'il y a 2 éléments initialement
    cy.get('p').should('have.length', 2);

    // Vérifie les textes des deux premiers éléments
    cy.get('p').eq(0).should('have.text', 'Hello World1');
    cy.get('p').eq(1).should('have.text', 'Hello World2');
  });

  it('Check the key is applied correctly and elements are not recreated', () => {
    cy.get('p')
      .eq(0)
      .then(firstElementBefore => {
        cy.get('p')
          .eq(1)
          .then(secondElementBefore => {
            cy.get('button').click();
            cy.get('p').should('have.length', 3);

            cy.get('p')
              .eq(0)
              .then(firstElementAfter => {
                cy.get('p')
                  .eq(1)
                  .then(secondElementAfter => {
                    expect(firstElementBefore[0]).to.equal(firstElementAfter[0]);
                    expect(secondElementBefore[0]).to.equal(secondElementAfter[0]);
                  });
              });
          });
      });
  });
});
