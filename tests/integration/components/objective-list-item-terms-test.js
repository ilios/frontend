import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | objective-list-item-terms', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  skip('it renders and is A11Y compliant ', async function(assert) {
    assert.expect(0);
    await render(hbs`<ObjectiveListItemTerms>`);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
