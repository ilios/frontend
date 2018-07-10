import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { percySnapshot } from 'ember-percy';

module('Integration | Component | login-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{login-form}}`);
    percySnapshot(assert);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
