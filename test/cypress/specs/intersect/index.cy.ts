import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Intersect directive tests', () => {
  it('should change text when intersecting', () => {
    const el = '#text-change';

    cy.get(el).contains('Hidden');

    cy.get(el).scrollIntoView({ duration: 500 });
    cy.wait(300);
    cy.get(el).contains('Visible');

    cy.scrollTo('top');
    cy.wait(300);
    cy.get(el).contains('Hidden');
  });

  it('should add and remove class on visibility', () => {
    const el = '#add-class';

    cy.get(el).should('not.have.class', 'highlight');

    cy.get(el).scrollIntoView({ duration: 500 });
    cy.wait(300);
    cy.get(el).should('have.class', 'highlight');

    cy.scrollTo('top');
    cy.wait(300);
    cy.get(el).should('not.have.class', 'highlight');
  });

  it("should toggle another element's visibility", () => {
    const controller = '#controller';
    const target = '#target';

    cy.get(target).should('have.class', 'hidden');

    cy.get(controller).scrollIntoView({ duration: 500 });
    cy.wait(300);
    cy.get(target).should('not.have.class', 'hidden');

    cy.scrollTo('top');
    cy.wait(300);
    cy.get(target).should('have.class', 'hidden');
  });

  it('should add class via d-intersect:class binding', () => {
    const el = '#attributeBinding';

    cy.get(el).should('not.have.class', 'highlight');
    cy.get(el).scrollIntoView({ duration: 500 });
    cy.wait(300);
    cy.get(el).should('have.class', 'highlight');

    cy.scrollTo('top');
    cy.wait(300);
    cy.get(el).should('not.have.class', 'highlight');
  });

  it('should add title via d-unintersect:title binding', () => {
    const el = '#attributeBindingOnUnintersect';

    cy.get(el).scrollIntoView({ duration: 500 });
    cy.wait(300);
    cy.get(el).should('not.have.attr', 'title');

    cy.scrollTo('top');
    cy.wait(300);
    cy.get(el).should('have.attr', 'title', 'Hello World');

    cy.get(el).scrollIntoView({ duration: 500 });
    cy.wait(300);
    cy.get(el).should('not.have.attr', 'title');
  });
});
