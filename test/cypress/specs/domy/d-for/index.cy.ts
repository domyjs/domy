import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-for test', () => {
  it('Check attribute removed', () => {
    cy.get('ul').should('not.have.attr', 'd-for');
    cy.get('body > ul > li').should('have.length', 1);
  });

  it('Check the adding element work', () => {
    cy.get('#add').click();
    cy.get('body > ul > li').should('have.length', 2);
  });

  it('Check removing element work', () => {
    cy.get('#add').click();
    cy.get('#rm').click();
    cy.get('body > ul > li').should('have.length', 1);
  });

  it('Check the event click trigger a change on the element', () => {
    cy.get('#add').click();

    cy.get('ul').children().eq(0).should('have.css', 'color', 'rgb(0, 0, 255)');
    cy.get('ul').children().eq(1).should('have.css', 'color', 'rgb(0, 0, 255)');

    cy.get('ul').children().eq(1).click();

    cy.get('ul').children().eq(0).should('have.css', 'color', 'rgb(0, 0, 255)');
    cy.get('ul').children().eq(1).should('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('Check the d-ignore is working into d-for', () => {
    cy.get('span').should('have.text', '{{ index }}');
  });

  it('Check the other d-for have the good index, is rendered and can trigger event on his self', () => {
    cy.get('.cars').should('have.length', 3);
    cy.get('.cars p').eq(1).should('have.text', '1: PEUGEOT');
    cy.get('.cars').first().click();
    cy.get('.cars p').eq(1).should('have.text', '1: MERCEDES');
  });
});
