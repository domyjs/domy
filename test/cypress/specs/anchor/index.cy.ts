import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Anchor test', () => {
  function testTooltipPosition(buttonId, tooltipId, expectedPositionCheck) {
    cy.get(`#${tooltipId}`).should('not.be.visible');
    cy.get(`#${buttonId}`).click();
    cy.get(`#${tooltipId}`)
      .should('be.visible')
      .then($tip => {
        cy.get(`#${buttonId}`).then($btn => {
          const btnRect = $btn[0].getBoundingClientRect();
          const tipRect = $tip[0].getBoundingClientRect();
          expectedPositionCheck(btnRect, tipRect);
        });
      });
    cy.get('body').click(0, 0);
    cy.get(`#${tooltipId}`).should('not.be.visible');
  }

  it('Tooltip BOTTOM (b)', () => {
    testTooltipPosition('btn-b', 'tip-b', (btnRect, tipRect) => {
      expect(tipRect.top).to.be.closeTo(btnRect.bottom, 2);
      expect(tipRect.left + tipRect.width / 2).to.be.closeTo(btnRect.left + btnRect.width / 2, 2);
    });
  });

  it('Tooltip BOTTOM_START (bs)', () => {
    testTooltipPosition('btn-bs', 'tip-bs', (btnRect, tipRect) => {
      expect(tipRect.top).to.be.closeTo(btnRect.bottom, 2);
      expect(tipRect.left).to.be.closeTo(btnRect.left, 2);
    });
  });

  it('Tooltip BOTTOM_END (be)', () => {
    testTooltipPosition('btn-be', 'tip-be', (btnRect, tipRect) => {
      expect(tipRect.top).to.be.closeTo(btnRect.bottom, 2);
      expect(tipRect.right).to.be.closeTo(btnRect.right, 2);
    });
  });

  it('Tooltip TOP (t)', () => {
    testTooltipPosition('btn-t', 'tip-t', (btnRect, tipRect) => {
      expect(tipRect.bottom).to.be.closeTo(btnRect.top, 2);
      expect(tipRect.left + tipRect.width / 2).to.be.closeTo(btnRect.left + btnRect.width / 2, 2);
    });
  });

  it('Tooltip TOP_START (ts)', () => {
    testTooltipPosition('btn-ts', 'tip-ts', (btnRect, tipRect) => {
      expect(tipRect.bottom).to.be.closeTo(btnRect.top, 2);
      expect(tipRect.left).to.be.closeTo(btnRect.left, 2);
    });
  });

  it('Tooltip TOP_END (te)', () => {
    testTooltipPosition('btn-te', 'tip-te', (btnRect, tipRect) => {
      expect(tipRect.bottom).to.be.closeTo(btnRect.top, 2);
      expect(tipRect.right).to.be.closeTo(btnRect.right, 2);
    });
  });

  it('Tooltip LEFT (l)', () => {
    testTooltipPosition('btn-l', 'tip-l', (btnRect, tipRect) => {
      expect(tipRect.right).to.be.closeTo(btnRect.left, 2);
      expect(tipRect.top + tipRect.height / 2).to.be.closeTo(btnRect.top + btnRect.height / 2, 2);
    });
  });

  it('Tooltip LEFT_START (ls)', () => {
    testTooltipPosition('btn-ls', 'tip-ls', (btnRect, tipRect) => {
      expect(tipRect.right).to.be.closeTo(btnRect.left, 2);
      expect(tipRect.top).to.be.closeTo(btnRect.top, 2);
    });
  });

  it('Tooltip LEFT_END (le)', () => {
    testTooltipPosition('btn-le', 'tip-le', (btnRect, tipRect) => {
      expect(tipRect.right).to.be.closeTo(btnRect.left, 2);
      expect(tipRect.bottom).to.be.closeTo(btnRect.bottom, 2);
    });
  });

  it('Tooltip RIGHT (r)', () => {
    testTooltipPosition('btn-r', 'tip-r', (btnRect, tipRect) => {
      expect(tipRect.left).to.be.closeTo(btnRect.right, 2);
      expect(tipRect.top + tipRect.height / 2).to.be.closeTo(btnRect.top + btnRect.height / 2, 2);
    });
  });

  it('Tooltip RIGHT_START (rs)', () => {
    testTooltipPosition('btn-rs', 'tip-rs', (btnRect, tipRect) => {
      expect(tipRect.left).to.be.closeTo(btnRect.right, 2);
      expect(tipRect.top).to.be.closeTo(btnRect.top, 2);
    });
  });

  it('Tooltip RIGHT_END (re)', () => {
    testTooltipPosition('btn-re', 'tip-re', (btnRect, tipRect) => {
      expect(tipRect.left).to.be.closeTo(btnRect.right, 2);
      expect(tipRect.bottom).to.be.closeTo(btnRect.bottom, 2);
    });
  });
});
