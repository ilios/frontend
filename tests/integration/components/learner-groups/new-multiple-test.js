import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/learner-groups/new-multiple';

module('Integration | Component | learner-groups/new-multiple', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<LearnerGroups::NewMultiple
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
    await render(hbs`<LearnerGroups::NewMultiple
      @generateNewLearnerGroups={{this.save}}
      @cancel={{(noop)}}
    />`);
    await component.setNumberOfGroups(13);
    await component.save();
  });
});
