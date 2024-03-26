import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    specPattern: 'cypress/attributes/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false
  }
});
