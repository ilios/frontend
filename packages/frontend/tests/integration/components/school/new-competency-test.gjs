import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school/new-competency';
import NewCompetency from 'frontend/components/school/new-competency';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school/new-competency', function (hooks) {
  setupRenderingTest(hooks);

  test('save', async function (assert) {
    const title = 'new co';
    this.set('add', (value) => {
      assert.step('add called');
      assert.strictEqual(value, title);
    });
    await render(<template><NewCompetency @add={{this.add}} /></template>);
    await component.title.set(title);
    await component.save();
    assert.verifySteps(['add called']);
  });

  test('validation fails if title is too short', async function (assert) {
    await render(<template><NewCompetency @add={{(noop)}} /></template>);
    assert.notOk(component.hasError);
    await component.title.set('');
    await component.title.submit();
    assert.ok(component.hasError);
  });

  test('validation fails if title is too long', async function (assert) {
    await render(<template><NewCompetency @add={{(noop)}} /></template>);
    assert.notOk(component.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.title.submit();
    assert.ok(component.hasError);
  });

  test('pressing escape in input element clears value and error messages', async function (assert) {
    await render(<template><NewCompetency @add={{(noop)}} /></template>);
    assert.notOk(component.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.title.submit();
    assert.ok(component.hasError);
    await component.title.cancel();
    assert.strictEqual(component.title.value, '');
    assert.notOk(component.hasError);
  });
});
