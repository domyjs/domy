import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents() {},
    specPattern: 'test/cypress/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    screenshotOnRunFailure: false
  }
});
