import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Mask test', () => {
  it('applies static mask for date input', () => {
    cy.get('#date').type('12122024');
    cy.get('#date').should('have.value', '12/12/2024');
  });

  it('applies dynamic mask for French phone starting with 33', () => {
    cy.get('#dynamic').type('33601020304');
    cy.get('#dynamic').should('have.value', '33 6 01 02 03 04');
  });

  it('applies dynamic mask for Canadian phone not starting with 33', () => {
    cy.get('#dynamic').clear();
    cy.get('#dynamic').type('5141234567');
    cy.get('#dynamic').should('have.value', '5 141 234 567');
  });

  it('applies money mask correctly', () => {
    cy.get('#money').type('1234567.8');
    cy.get('#money').blur();
    cy.get('#money').should('have.value', '1,234,567.8');
  });

  it('applies static mask for letter+number', () => {
    cy.get('#letters').type('AC1234');
    cy.get('#letters').should('have.value', 'AC 1234');
  });
});
