import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/ilios-header';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import pageTitle from 'ember-page-title/helpers/page-title';
import IliosHeader from 'frontend/components/ilios-header';

module('Integration | Component | ilios-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks); //even though we're not using mirage directly we need to ensure that /config API is owned

  test('it renders and is accessible', async function (assert) {
    this.set('title', 'test');
    await render(
      <template>
        {{pageTitle this.title}}
        <IliosHeader />
      </template>,
    );
    assert.ok(component.isPresent);
    assert.strictEqual(component.title, 'test');

    await a11yAudit(this.element);
  });
});
