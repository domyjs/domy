import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Event Handling Test', () => {
  it('should capture the click event type when the button is clicked', () => {
    const eventTypeHeader = '#eventType';
    const eventButton = '#eventButton';

    cy.get(eventTypeHeader).should('have.text', '');

    cy.get(eventButton).click();

    cy.get(eventTypeHeader).should('have.text', 'click');
  });
});
