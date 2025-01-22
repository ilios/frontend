import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// todo: flesh this out. [ST 2025/01/19]
module('Integration | Modifier | date-picker', function (hooks) {
  setupRenderingTest(hooks);

  test('it works with minimal input', async function (assert) {
    this.set('value', Date.now());
    this.set('minDate', null);
    this.set('maxDate', null);
    this.set('locale', 'en');
    await render(
      hbs`<div
  {{date-picker
    this.value
    minDate=this.minDate
    maxDate=this.maxDate
    locale=this.locale
    onChangeHandler=(noop)
  }}
></div>`,
    );
    // todo: add more test assertions here.
    assert.ok(true);
  });
});
