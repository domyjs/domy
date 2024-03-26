import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-if test', () => {
  it('Check element not in dom', () => {
    cy.get('main').should('not.exist');
  });

  it('Check the element is display/removed after a click', () => {
    cy.get('#inc').click();
    cy.get('main').should('exist');

    cy.get('#dec').click();
    cy.get('main').should('not.exist');
  });

  it('Check content display in correct order', () => {
    cy.get('#inc').click();

    cy.get('#p0').should('exist');
    cy.get('#p1').should('not.exist');
    cy.get('#p2').should('not.exist');

    cy.get('#inc').click();

    cy.get('#p0').then($el => {
      expect($el.prevAll().length).to.equal(0);
    });
    cy.get('#p1').then($el => {
      expect($el.prevAll().length).to.equal(1);
    });
    cy.get('#p2').should('not.exist');

    cy.get('#inc').click();
    cy.get('#p0').then($el => {
      expect($el.prevAll().length).to.equal(1);
    });
    cy.get('#p1').then($el => {
      expect($el.prevAll().length).to.equal(2);
    });
    cy.get('#p2').then($el => {
      expect($el.prevAll().length).to.equal(0);
    });
  });
});
