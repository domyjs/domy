import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Plugin Separation test', () => {
  it('Check the plugin only act on their app', () => {
    cy.get('#app1').get('p').contains('Hello World!');
    cy.get('#app1').get('span').contains('{{ $bye }}');

    cy.get('#app2').get('p').contains('{{ $hello }}');
    cy.get('#app2').get('span').contains('Bye World!');
  });
});
