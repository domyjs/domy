import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Components tests', () => {
  it('should not display count 2 but the other yes', () => {
    cy.get('#count-2').should('not.exist');
    cy.get('#count-1').should('exist');
    cy.get('#count-3').should('exist');
  });

  it('Check we can add listener to components', () => {
    cy.get('#count-1').should('exist');
    cy.get('#count-3').should('exist');

    cy.get('#componentClick').contains('0');

    cy.get('#count-1').click();
    cy.get('#componentClick').contains('1');

    cy.get('#count-3').click();
    cy.get('#componentClick').contains('2');
  });

  it('should increment the count when the "+" button is clicked', () => {
    cy.get('#count-1 p').contains('Count: 0');
    cy.get('#count-1 button').contains('+').click();
    cy.get('#count-1 p').contains('Count: 1');

    cy.get('#count-3 p').contains('Count: 0');
    cy.get('#count-3 button').contains('+').click();
    cy.get('#count-3 p').contains('Count: 1');
  });

  it('should decrement the count when the "-" button is clicked', () => {
    cy.get('#count-1 button').contains('+').click();
    cy.get('#count-1 p').contains('Count: 1');

    cy.get('#count-1 button').contains('-').click();
    cy.get('#count-1 p').contains('Count: 0');
  });

  it('should show an error message when count is less than 0', () => {
    cy.get('#count-1 button').contains('-').click();
    cy.get('#count-1 p').contains('Count: -1');
    cy.get('#count-1 p').contains('Error Message:');
    cy.get('#count-1 p').contains('The count as to be greater than 0!');

    cy.get('#count-3 p').contains('Count: 0');
    cy.get('#count-3 p').contains('Error Message:');
    cy.get('#count-3 p').contains('The count as to be greater than 0!');
  });

  it('should close the error message when the "X" button is clicked', () => {
    cy.get('#count-1 button').contains('-').click();
    cy.get('#count-1 p').contains('Error Message:');

    cy.get('#count-1 button').contains('X').click();

    cy.get('#count-1 p').should('not.contain', 'Error Message:');
    cy.get('#count-3 p').should('not.contain', 'Error Message:');
  });

  it('should hide the error message when count is incremented back to 0 or more', () => {
    cy.get('#count-1 button').contains('-').click();
    cy.get('#count-1 p').contains('Error Message:');

    cy.get('#count-1 button').contains('+').click();
    cy.get('#count-1 p').contains('Count: 0');

    cy.get('#count-1 p').should('not.contain', 'Error Message:');
    cy.get('#count-3 p').should('not.contain', 'Error Message:');
  });
});
