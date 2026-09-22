import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/dashboard/filter-checkbox';
import FilterCheckbox from 'ilios-common/components/dashboard/filter-checkbox';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | dashboard/filter-checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders unchecked', async function (assert) {
    const id = '100';
    this.set('content', 'label text');
    this.set('id', id);
    await render(
      <template>
        <FilterCheckbox @checked={{false}} @add={{(noop)}} @remove={{(noop)}} @targetId={{this.id}}>
          {{this.content}}
        </FilterCheckbox>
      </template>,
    );

    assert.strictEqual(component.text, 'label text');
    assert.notOk(component.isChecked);
    assert.strictEqual(component.id, id);
  });

  test('it renders checked', async function (assert) {
    this.set('content', 'label text');
    await render(
      <template>
        <FilterCheckbox @checked={{true}} @add={{(noop)}} @remove={{(noop)}}>
          {{this.content}}
        </FilterCheckbox>
      </template>,
    );
    assert.strictEqual(component.text, 'label text');
    assert.ok(component.isChecked);
  });

  test('clicking label when checked fires remove', async function (assert) {
    this.set('content', 'label text');
    this.set('remove', () => {
      assert.step('remove called');
    });
    await render(
      <template>
        <FilterCheckbox @checked={{true}} @add={{(noop)}} @remove={{this.remove}}>
          {{this.content}}
        </FilterCheckbox>
      </template>,
    );

    await component.click();
    assert.verifySteps(['remove called']);
  });

  test('clicking label when not checked fires add', async function (assert) {
    this.set('content', 'label text');
    this.set('add', () => {
      assert.step('add called');
    });
    await render(
      <template>
        <FilterCheckbox @checked={{false}} @add={{this.add}} @remove={{(noop)}}>
          {{this.content}}
        </FilterCheckbox>
      </template>,
    );

    await component.click();
    assert.verifySteps(['add called']);
  });
});
