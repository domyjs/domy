import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-model simple input test', () => {
  it('Check attribute is removed', () => {
    cy.get('#simple-input input').should('not.have.attr', 'd-model');
  });

  it('Check the default value is set', () => {
    cy.get('#simple-input input').should('have.value', 'Hello World!');
    cy.get('#simple-input p').should('have.text', 'Hello World!');
  });

  it('Check if the value change the notifier is triggered', () => {
    cy.get('#simple-input input').type('Hello World!');
    cy.get('#simple-input p').should('have.text', 'Hello World!Hello World!');
  });

  it('Check if the state change the value change', () => {
    cy.get('#simple-input button').click();
    cy.get('#simple-input input').should('have.value', 'Bye World!');
    cy.get('#simple-input p').should('have.text', 'Bye World!');
  });
});

describe('Attribute d-model lazy modifier test', () => {
  it('Check if the value change after a click outside', () => {
    cy.get('#lazy-modifier input').type('Hello World!');
    cy.get('#lazy-modifier p').should('have.text', 'Lazy: Hello World!');

    cy.get('#lazy-modifier input').blur(); // We remove the focus from the current input
    cy.get('#lazy-modifier p').should('have.text', 'Lazy: Hello World!Hello World!');
  });
});

describe('Attribute d-model textarea test', () => {
  it('Check if the value change', () => {
    cy.get('#textarea p').should('have.text', 'Hello World!');
    cy.get('#textarea textarea').type('Hello World!');
    cy.get('#textarea p').should('have.text', 'Hello World!Hello World!');
  });
});

describe('Attribute d-model input number test', () => {
  it('Check if the value change and is a number', () => {
    cy.get('#number-input p').should('have.text', 'res: 0 number');
    cy.get('#number-input input').type('{backspace}');
    cy.get('#number-input p').should('have.text', 'res:  string');
    cy.get('#number-input input').type('123');
    cy.get('#number-input p').should('have.text', 'res: 123 number');
  });
});

describe('Attribute d-model number modifier test', () => {
  it('Check if the value change and is a number', () => {
    cy.get('#number-modifier p').should('have.text', 'res: 0 number');
    cy.get('#number-modifier input').type('{backspace}');
    cy.get('#number-modifier p').should('have.text', 'res:  string');
    cy.get('#number-modifier input').type('123');
    cy.get('#number-modifier p').should('have.text', 'res: 123 number');
  });
});

describe('Attribute d-model select test', () => {
  it('Check the default value is correct', () => {
    cy.get('#select p').should('have.text', 'red');
    cy.get('#select select').should('have.value', 'red');
  });

  it('Check if the value change after we click on blue', () => {
    cy.get('#select select').select('blue');
    cy.get('#select select').should('have.value', 'blue');
    cy.get('#select p').should('have.text', 'blue');
  });
});

describe('Attribute d-model select multiple test', () => {
  it('Check the default value is correct', () => {
    cy.get('#select-multiple select').within(() => {
      cy.get('option:selected').should('have.length', 2);
      cy.get('option:selected').first().should('have.value', 'red');
      cy.get('option:selected').last().should('have.value', 'blue');
    });
    cy.get('#select-multiple p').should('have.text', 'red,blue');
  });

  it('Check if the value changes after selecting green and blue', () => {
    cy.get('#select-multiple select').select(['green', 'blue']);
    cy.get('#select-multiple select').within(() => {
      cy.get('option:selected').should('have.length', 2);
      cy.get('option:selected').first().should('have.value', 'blue');
      cy.get('option:selected').last().should('have.value', 'green');
    });
    cy.get('#select-multiple p').should('have.text', 'blue,green');
  });
});

describe('Attribute d-model radio test', () => {
  it('Check the default value is correct', () => {
    cy.get('#radio p').should('have.text', 'red');
    cy.get('#radio input[type="radio"]:checked').should('have.value', 'red');
  });

  it('Check if the value changes after we click on blue', () => {
    cy.get('#radio input[type="radio"][value="blue"]').click();
    cy.get('#radio p').should('have.text', 'blue');

    cy.get('#radio input[type="radio"]:checked').should('have.value', 'blue');
  });
});

describe('Attribute d-model checkbox test', () => {
  it('Check the default value is correct', () => {
    cy.get('#checkbox label').should('have.text', 'true');
    cy.get('#checkbox input[type="checkbox"]').should('be.checked');
  });

  it('Check if the value changes to false', () => {
    cy.get('#checkbox input[type="checkbox"]').click();
    cy.get('#checkbox input[type="checkbox"]').should('not.be.checked');
    cy.get('#checkbox label').should('have.text', 'false');

    cy.get('#checkbox input[type="checkbox"]').click();
    cy.get('#checkbox input[type="checkbox"]').should('be.checked');
    cy.get('#checkbox label').should('have.text', 'true');
  });
});

describe('Attribute d-model multiple checkbox test', () => {
  it('Check the default value is correct', () => {
    // Check the default state of checkboxes and associated text
    cy.get('#multiple-checkbox p').should('have.text', 'red'); // This checks some text associated with the checkbox, assuming it's managed by a `<p>` tag.
    cy.get('#multiple-checkbox input[type="checkbox"][value="red"]').should('be.checked'); // This checks if the checkbox with value 'red' is checked.
  });

  it('Check if the value changes correctly', () => {
    // Check initially if only 'red' is checked
    cy.get('#multiple-checkbox input[type="checkbox"][value="red"]').should('be.checked');
    cy.get('#multiple-checkbox input[type="checkbox"]:not([value="red"])').should('not.be.checked'); // Ensures no other checkboxes are checked.

    // Click to check 'green' and 'blue', and uncheck 'red'
    cy.get('#multiple-checkbox input[type="checkbox"][value="green"]').click();
    cy.get('#multiple-checkbox input[type="checkbox"][value="blue"]').click();
    cy.get('#multiple-checkbox input[type="checkbox"][value="red"]').click();

    // Verify the changes
    cy.get('#multiple-checkbox input[type="checkbox"][value="green"]').should('be.checked');
    cy.get('#multiple-checkbox input[type="checkbox"][value="blue"]').should('be.checked');
    cy.get('#multiple-checkbox input[type="checkbox"][value="red"]').should('not.be.checked');

    // Check if the associated text or handling logic reflects these changes
    // This assumes you are updating some `<p>` element text or similar based on checkbox states.
    cy.get('#multiple-checkbox p').should('have.text', 'green,blue');
  });
});
