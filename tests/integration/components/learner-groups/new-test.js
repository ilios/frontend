import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/learner-groups/new';

module('Integration | Component | learner-groups/new', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<LearnerGroups::New
      @save={{(noop)}}
      @cancel={{(noop)}}
      @fillModeSupported={{true}}
    />`);
    assert.ok(component.single.isVisible);
    await a11yAudit(this.element);
  });

  test('it renders multimode', async function (assert) {
    await render(hbs`<LearnerGroups::New
      @save={{(noop)}}
      @cancel={{(noop)}}
      @generateNewLearnerGroups={{(noop)}}
      @multiModeSupported={{true}}
    />`);
    await component.chooseMultipleGroups();
    assert.ok(component.multiple.isVisible);
    await a11yAudit(this.element);
  });
});
