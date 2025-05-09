import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/learner-group/new-multiple';
import NewMultiple from 'frontend/components/learner-group/new-multiple';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learner-group/new-multiple', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(
      <template><NewMultiple @cancel={{(noop)}} @generateNewLearnerGroups={{(noop)}} /></template>,
    );
    assert.strictEqual(component.numb);
    assert.ok(component.isVisible);
    await a11yAudit(this.element);
  });

  test('save fails if number of groups is blank', async function (assert) {
    await render(
      <template><NewMultiple @cancel={{(noop)}} @generateNewLearnerGroups={{(noop)}} /></template>,
    );
    assert.notOk(component.hasError);
    await component.set('');
    await component.save();
    assert.strictEqual(component.error, 'Number of Groups must be a number');
  });

  test('save fails if number of groups is not an integer', async function (assert) {
    await render(
      <template><NewMultiple @cancel={{(noop)}} @generateNewLearnerGroups={{(noop)}} /></template>,
    );
    assert.notOk(component.hasError);
    await component.set('1.4');
    await component.save();
    assert.strictEqual(component.error, 'Number of Groups must be an integer');
  });

  test('save fails if number of groups must be positive', async function (assert) {
    await render(
      <template><NewMultiple @cancel={{(noop)}} @generateNewLearnerGroups={{(noop)}} /></template>,
    );
    assert.notOk(component.hasError);
    await component.set('0');
    await component.save();
    assert.strictEqual(component.error, 'Number of Groups must be greater than or equal to 1');
  });

  test('save fails if number of groups is too large', async function (assert) {
    await render(
      <template><NewMultiple @cancel={{(noop)}} @generateNewLearnerGroups={{(noop)}} /></template>,
    );
    assert.notOk(component.hasError);
    await component.set('51');
    await component.save();
    assert.strictEqual(component.error, 'Number of Groups must be less than or equal to 50');
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('save', (num) => {
      assert.strictEqual(parseInt(num, 10), 13);
    });
    await render(
      <template>
        <NewMultiple @generateNewLearnerGroups={{this.save}} @cancel={{(noop)}} />
      </template>,
    );
    await component.set('13');
    await component.save();
  });
});
