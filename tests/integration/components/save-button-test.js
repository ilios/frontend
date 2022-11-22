import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | save-button', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.set('label', 'Save');
    await render(hbs`<SaveButton>{{this.label}}</SaveButton>
`);
    assert.dom().hasText('Save');
  });

  test('it displays save percent and spinner when saving', async function (assert) {
    this.set('label', 'Save');
    await render(hbs`<SaveButton @isSaving={{true}} @saveProgressPercent={{11}}>{{this.label}}</SaveButton>
`);
    assert.dom('[data-icon="spinner"]').exists();
    assert.dom().hasText('11%');
  });

  test('icon is a check at 100%', async function (assert) {
    this.set('label', 'Save');
    await render(
      hbs`<SaveButton @isSaving={{true}} @saveProgressPercent={{100}}>{{this.label}}</SaveButton>
`
    );
    assert.dom('[data-icon="check"]').exists();
    assert.dom().hasText('100%');
  });

  test('binds passed action', async function (assert) {
    assert.expect(1);
    this.set('label', 'Save');
    this.set('click', () => assert.ok(true));
    await render(hbs`<SaveButton data-test-save {{on "click" this.click}}>{{this.label}}</SaveButton>
`);
    await click('[data-test-save]');
  });
});
