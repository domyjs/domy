import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-for index test', () => {
  it('Check attribute removed', () => {
    cy.get('ul').should('not.have.attr', 'd-for');
    cy.get('body > ul > li').should('have.length', 2);
  });

  it('Check name update', () => {
    cy.get('button').click();
    cy.get('ul').children().eq(0).get('p').contains('Yoann_changed');
    cy.get('ul').children().eq(1).get('p').contains('Will_changed');
  });

  it('Check removing element update index', () => {
    cy.get('ul').children().eq(0).get('span').contains('0');
    cy.get('ul').children().eq(1).get('span').contains('1');

    cy.get('ul').children().eq(0).click();
    cy.get('ul').children().eq(1).get('span').contains('0');
  });
});
