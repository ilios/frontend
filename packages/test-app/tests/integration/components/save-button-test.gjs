import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
import SaveButton from 'ilios-common/components/save-button';
import { on } from '@ember/modifier';

module('Integration | Component | save-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('label', 'Save');
    await render(
      <template>
        <SaveButton>{{this.label}}</SaveButton>
      </template>,
    );
    assert.dom().hasText('Save');
  });

  test('it displays save percent and spinner when saving', async function (assert) {
    this.set('label', 'Save');
    await render(
      <template>
        <SaveButton @isSaving={{true}} @saveProgressPercent={{11}}>{{this.label}}</SaveButton>
      </template>,
    );
    assert.dom('[data-icon="spinner"]').exists();
    assert.dom().hasText('11%');
  });

  test('icon is a check at 100%', async function (assert) {
    this.set('label', 'Save');
    await render(
      <template>
        <SaveButton @isSaving={{true}} @saveProgressPercent={{100}}>{{this.label}}</SaveButton>
      </template>,
    );
    assert.dom('[data-icon="check"]').exists();
    assert.dom().hasText('100%');
  });

  test('binds passed action', async function (assert) {
    assert.expect(1);
    this.set('label', 'Save');
    this.set('click', () => assert.ok(true));
    await render(
      <template>
        <SaveButton data-test-save {{on "click" this.click}}>{{this.label}}</SaveButton>
      </template>,
    );
    await click('[data-test-save]');
  });
});
