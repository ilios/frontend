import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/learner-group/new-multiple';

module('Integration | Component | learner-group/new-multiple', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<LearnerGroup::NewMultiple
      @cancel={{(noop)}}
      @generateNewLearnerGroups={{(noop)}}
    />`);
    assert.ok(component.isVisible);
    await a11yAudit(this.element);
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('save', (num) => {
      assert.strictEqual(parseInt(num, 10), 13);
    });
    await render(hbs`<LearnerGroup::NewMultiple
      @generateNewLearnerGroups={{this.save}}
      @cancel={{(noop)}}
    />`);
    await component.setNumberOfGroups(13);
    await component.save();
  });
});
