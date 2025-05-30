import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/instructor-groups/new';
import New from 'frontend/components/instructor-groups/new';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | instructor-groups/new', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.title.label, 'Title:');
    assert.strictEqual(component.done.text, 'Done');
    assert.strictEqual(component.cancel.text, 'Cancel');
    await a11yAudit(this.element);
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
    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.notOk(component.title.hasError);
    await component.done.click();
    assert.strictEqual(component.title.error, 'Title can not be blank');
  });

  test('validation fails, title too short', async function (assert) {
    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.notOk(component.title.hasError);
    await component.title.set('Aa');
    await component.done.click();
    assert.strictEqual(component.title.error, 'Title is too short (minimum is 3 characters)');
  });

  test('validation fails, title too long', async function (assert) {
    await render(<template><New @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.notOk(component.title.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.done.click();
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 60 characters)');
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('save', async (instructorGroup) => {
      assert.strictEqual(instructorGroup.title, 'Jayden Rules!');
    });

    await render(<template><New @save={{this.save}} @cancel={{(noop)}} /></template>);
    await component.title.set('Jayden Rules!');
    await component.done.click();
  });
});
