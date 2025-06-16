import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Router test', () => {
  it('should display Home by default', () => {
    cy.get('h1').contains('Home');
    cy.get('footer').should('contain.text', '/');
  });

  it('should navigate to About route', () => {
    cy.get('#About').click();
    cy.get('h1').contains('About');
    cy.get('footer').should('contain.text', '/about');
  });

  it('should navigate to Params with :id', () => {
    cy.get('#Params').click();
    cy.get('h1').contains('Params');
    cy.get('footer').should('contain.text', '5');
  });

  it('should work with custom regex', () => {
    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/order/5' });
    });
    cy.get('h1').contains('Order');
    cy.get('footer').should('contain.text', '/order/5');

    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/order/a' });
    });
    cy.get('h1').contains('NotFound');
    cy.get('footer').should('contain.text', '/order/a');
  });

  it('should support optional param :name?', () => {
    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/optional/toto/segment' });
    });
    cy.get('h1').contains('NotFound');
    cy.get('footer').should('contain.text', '/optional/toto/segment');

    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/optional/toto' });
    });
    cy.get('h1').contains('Optional');
    cy.get('footer').should('contain.text', '/optional/toto');

    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/optional' });
    });
    cy.get('h1').contains('NotFound');
    cy.get('footer').should('contain.text', '/optional');
  });

  it('should support wildcard param :test*', () => {
    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/wildcard/route/segments' });
    });
    cy.get('h1').contains('Wildcard');
    cy.get('footer').should('contain.text', '/wildcard/route/segments');

    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/wildcard' });
    });
    cy.get('h1').contains('Wildcard');
    cy.get('footer').should('contain.text', '/wildcard');
  });

  it('should support rest param :test+', () => {
    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/rest/route/segment' });
    });
    cy.get('h1').contains('Rest');
    cy.get('footer').should('contain.text', '/rest/route/segment');

    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/rest/route' });
    });
    cy.get('h1').contains('Rest');
    cy.get('footer').should('contain.text', '/rest/route');

    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/rest' });
    });
    cy.get('h1').contains('NotFound');
    cy.get('footer').should('contain.text', '/rest');
  });

  it('should handle non-existing route', () => {
    cy.window().then((win: any) => {
      win.DIR.router.navigate({ path: '/something/that/doesnt/exist' });
    });
    cy.get('h1').contains('NotFound');
    cy.get('footer').should('contain.text', '/something/that/doesnt/exist');
  });

  it('should apply activeClass to current route', () => {
    cy.get('#About').click();
    cy.contains('About').should('have.class', 'red');
    cy.contains('Home').should('not.have.class', 'red');
  });

  it('should go back and forward', () => {
    cy.get('#About').click();
    cy.go('back');
    cy.get('h1').contains('Home');
    cy.go('forward');
    cy.get('h1').contains('About');
  });

  it('should generate correct href with hash', () => {
    cy.get('a').each($a => {
      expect($a.prop('href')).to.include('#/');
    });
  });

  it('should generate the correct path', () => {
    cy.window().then((win: any) => {
      win.DIR.router.navigate({ name: 'Params', params: { id: 5 } });
    });
    cy.get('h1').contains('Params');
    cy.get('footer').should('contain.text', '5');
  });
});
