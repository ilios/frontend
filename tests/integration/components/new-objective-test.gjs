import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import NewObjective from 'ilios-common/components/new-objective';
import noop from 'ilios-common/helpers/noop';
import { component } from 'ilios-common/page-objects/components/new-objective';

module('Integration | Component | new objective', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><NewObjective @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.title, 'New Objective');
    assert.strictEqual(component.description.label, 'Description:');
  });

  test('validation fails if description is too short', async function (assert) {
    await render(<template><NewObjective @cancel={{(noop)}} /></template>);
    assert.notOk(component.description.hasError);
    await component.description.set('a');
    await component.save();
    assert.strictEqual(
      component.description.error,
      'Description is too short (minimum is 3 characters)',
    );
  });

  test('validation fails if description is too long', async function (assert) {
    await render(<template><NewObjective @cancel={{(noop)}} /></template>);
    assert.notOk(component.description.hasError);
    await component.description.set('a'.repeat(65001));
    await component.save();
    assert.strictEqual(
      component.description.error,
      'Description is too long (maximum is 65000 characters)',
    );
  });

  test('save triggers', async function (assert) {
    this.set('save', (value) => {
      assert.step('save called');
      assert.strictEqual(value, '<p>yoo hoo</p>');
    });
    await render(<template><NewObjective @save={{this.save}} @cancel={{(noop)}} /></template>);
    await component.description.set('yoo hoo');
    await component.save();
    assert.verifySteps(['save called']);
  });

  test('cancel triggers', async function (assert) {
    this.set('cancel', () => {
      assert.step('cancel called');
    });
    await render(<template><NewObjective @cancel={{this.cancel}} /></template>);
    await component.cancel();
    assert.verifySteps(['cancel called']);
  });
});
