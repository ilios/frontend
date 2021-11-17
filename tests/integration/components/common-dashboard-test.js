import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | common dashboard', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<CommonDashboard @show="week" @setShow={{(noop)}} />`);
    assert.ok(this.element.textContent.includes('Week at a Glance'));
    assert.ok(this.element.textContent.includes('Activities'));
    assert.ok(this.element.textContent.includes('Materials'));
    assert.ok(this.element.textContent.includes('Calendar'));
  });
});
