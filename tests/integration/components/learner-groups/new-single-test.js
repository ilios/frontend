import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/learner-groups/new-single';

module('Integration | Component | learner-groups/new-single', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders without fill mode', async function (assert) {
    await render(hbs`<LearnerGroups::NewSingle
      @save={{(noop)}}
      @cancel={{(noop)}}
    />`);
    assert.ok(component.isVisible);
    assert.notOk(component.canFill);
    await a11yAudit(this.element);
  });

  test('it renders with fill mode false', async function (assert) {
    await render(hbs`<LearnerGroups::NewSingle
      @save={{(noop)}}
      @cancel={{(noop)}}
      @fillModeSupported={{false}}
    />`);
    assert.ok(component.isVisible);
    assert.notOk(component.canFill);
    await a11yAudit(this.element);
  });

  test('save', async function (assert) {
    assert.expect(2);
    this.set('save', (title, fill) => {
      assert.equal(title, 'new group');
      assert.false(fill);
    });
    await render(hbs`<LearnerGroups::NewSingle
      @save={{this.save}}
      @cancel={{(noop)}}
      @fillModeSupported={{true}}
    />`);
    await component.title('new group');
    await component.save();
  });

  test('save filled', async function (assert) {
    assert.expect(3);
    this.set('save', (title, fill) => {
      assert.equal(title, 'new group');
      assert.true(fill);
    });
    await render(hbs`<LearnerGroups::NewSingle
      @save={{this.save}}
      @cancel={{(noop)}}
      @fillModeSupported={{true}}
    />`);
    await component.title('new group');
    assert.ok(component.canFill);
    await component.fillWithCohort();
    await component.save();
  });
});
