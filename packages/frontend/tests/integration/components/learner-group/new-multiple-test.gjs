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
    assert.ok(component.isVisible);
    await a11yAudit(this.element);
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
    await component.setNumberOfGroups(13);
    await component.save();
  });
});
