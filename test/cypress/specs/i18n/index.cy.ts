import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('i18n Functionality Test', () => {
  it('should display the correct initial text in English', () => {
    // Check the title
    cy.get('h1').should('have.text', 'Hello World!');

    // Check the greeting message with a valid name
    cy.get('#validName').should('have.text', 'Message: Hello, Yoann');

    // Check the greeting message without a name
    cy.get('#invalideName').should('have.text', 'Message: Bye, {{ name }}');
  });

  it('should change the name when the button is clicked', () => {
    // Click the button to change the name
    cy.get('#name').click();

    // Check the greeting message with the new name
    cy.get('#validName').should('have.text', 'Message: Hello, Pierre');
  });

  it('should change the language to French', () => {
    // Click the button to change the language to French
    cy.get('#fr').click();

    // Check the title in French
    cy.get('h1').should('have.text', 'Bonjour le monde!');

    // Check the greeting message with the new name in French
    cy.get('#validName').should('have.text', 'Message: Bonjour, Yoann');

    // Check the greeting message without a name in French
    cy.get('#invalideName').should('have.text', 'Message: Aurevoir, {{ name }}');
  });

  it('should change the language to UK and then back to French', () => {
    // Click the button to change the language to UK
    cy.get('#uk').click();

    // Since UK isn't defined, it should fall back to English
    cy.get('h1').should('have.text', 'Hello World!');

    // Change the language to French
    cy.get('#fr').click();

    // Check the title in French
    cy.get('h1').should('have.text', 'Bonjour le monde!');
  });

  it('Check default message is working', () => {
    cy.get('#defaultMessage').contains('Message: default message');
  });

  it('Check we return the key if the message doesnt exist', () => {
    cy.get('#invalideKey').should('have.text', 'Message: key.who.doesnt.exist');
  });

  it('Check we can get all suported langages', () => {
    cy.get('#supportedLangages').should('have.text', 'en,fr');
  });

  it('Check the hook is working', () => {
    cy.get('h2').contains('Hello World!');
  });
});
