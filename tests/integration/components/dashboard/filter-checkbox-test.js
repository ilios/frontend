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
    const id = '100';
    this.set('content', 'label text');
    this.set('id', id);
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{false}}
        @add={{(noop)}}
        @remove={{(noop)}}
        @targetId={{this.id}}
      >
        {{this.content}}
      </Dashboard::FilterCheckbox>
`);

    assert.strictEqual(component.text, 'label text');
    assert.notOk(component.isChecked);
    assert.strictEqual(component.id, id);
  });

  test('it renders checked', async function (assert) {
    this.set('content', 'label text');
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{true}}
        @add={{(noop)}}
        @remove={{(noop)}}
      >
       {{this.content}}
      </Dashboard::FilterCheckbox>

`);
    assert.strictEqual(component.text, 'label text');
    assert.ok(component.isChecked);
  });

  test('clicking label when checked fires remove', async function (assert) {
    assert.expect(1);
    this.set('content', 'label text');
    this.set('remove', () => {
      assert.ok(true);
    });
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{true}}
        @add={{(noop)}}
        @remove={{this.remove}}
      >
        {{this.content}}
      </Dashboard::FilterCheckbox>

`);

    await component.click();
  });

  test('clicking label when not checked fires add', async function (assert) {
    assert.expect(1);
    this.set('content', 'label text');
    this.set('add', () => {
      assert.ok(true);
    });
    await render(hbs`
      <Dashboard::FilterCheckbox
        @checked={{false}}
        @add={{this.add}}
        @remove={{(noop)}}
      >
        {{this.content}}
      </Dashboard::FilterCheckbox>

`);

    await component.click();
  });
});
