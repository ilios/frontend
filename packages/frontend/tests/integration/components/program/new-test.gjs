import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program/new';
import New from 'frontend/components/program/new';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | program/new', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.title.label, 'Title:');
    assert.strictEqual(component.done.text, 'Done');
    assert.strictEqual(component.cancel.text, 'Cancel');
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel fired.');
    });
    await render(<template><New @save={{(noop)}} @cancel={{this.cancel}} /></template>);
    await component.cancel.click();
  });

  test('validation fails, no title', async function (assert) {
    assert.expect(3);

    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.title.errors.length, 0);
    await component.done.click();
    assert.strictEqual(component.title.errors.length, 1);
    assert.strictEqual(component.title.errors[0].text, 'Title can not be blank');
  });

  test('validation fails, title too short', async function (assert) {
    assert.expect(3);

    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.title.errors.length, 0);
    await component.title.set('Aa');
    await component.done.click();
    assert.strictEqual(component.title.errors.length, 1);
    assert.strictEqual(
      component.title.errors[0].text,
      'Title is too short (minimum is 3 characters)',
    );
  });

  test('validation fails, title too long', async function (assert) {
    assert.expect(3);

    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.title.errors.length, 0);
    await component.title.set('0123456789'.repeat(21));
    await component.done.click();
    assert.strictEqual(component.title.errors.length, 1);
    assert.strictEqual(
      component.title.errors[0].text,
      'Title is too long (maximum is 200 characters)',
    );
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('save', async (program) => {
      assert.strictEqual(program.title, 'Jayden Rules!');
    });

    await render(<template><New @save={{this.save}} @cancel={{(noop)}} /></template>);
    await component.title.set('Jayden Rules!');
    await component.done.click();
  });
});
