import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/dashboard/filter-checkbox';

module('Integration | Component | dashboard/filter-checkbox', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

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

    assert.strictEqual(component.text, 'label text');
    assert.notOk(component.isChecked);
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
    assert.strictEqual(component.text, 'label text');
    assert.ok(component.isChecked);
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

    await component.click();
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

    await component.click();
  });
});
