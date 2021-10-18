import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard/filter-checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders unchecked', async function (assert) {
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{false}}
        @add={{(noop)}}
        @remove={{(noop)}}
      >
        label text
      </Dashboard::FilterCheckbox>
    `);

    assert.dom().containsText('label text');
    assert.dom('input').exists();
    assert.dom('input').hasAttribute('type', 'checkbox');
    assert.dom('input').isNotChecked();
  });

  test('it renders checked', async function (assert) {
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{true}}
        @add={{(noop)}}
        @remove={{(noop)}}
      >
        label text
      </Dashboard::FilterCheckbox>
    `);

    assert.dom().containsText('label text');
    assert.dom('input').exists();
    assert.dom('input').hasAttribute('type', 'checkbox');
    assert.dom('input').isChecked();
  });

  test('clicking label when checked fires remove', async function (assert) {
    assert.expect(1);
    this.set('remove', () => {
      assert.ok(true);
    });
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{true}}
        @add={{(noop)}}
        @remove={{this.remove}}
      >
        label text
      </Dashboard::FilterCheckbox>
    `);

    await click('label');
  });

  test('clicking label when not checked fires add', async function (assert) {
    assert.expect(1);
    this.set('add', () => {
      assert.ok(true);
    });
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{false}}
        @add={{this.add}}
        @remove={{(noop)}}
      >
        label text
      </Dashboard::FilterCheckbox>
    `);

    await click('label');
  });
});
