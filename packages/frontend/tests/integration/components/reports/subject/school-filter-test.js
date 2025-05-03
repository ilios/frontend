import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | reports/subject/school-filter', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Reports::Subject::SchoolFilter />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`<Reports::Subject::SchoolFilter>
  template block text
</Reports::Subject::SchoolFilter>`);

    assert.dom().hasText('template block text');
  });
});
