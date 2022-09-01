import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/ilios-header';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | ilios-header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks); //even though we're not using mirage directly we need to ensure that /config API is owned

  test('it renders and is accessible', async function (assert) {
    this.set('title', 'test');
    await render(hbs`
      {{page-title this.title}}
      <IliosHeader />
    `);
    assert.ok(component.isPresent);
    assert.strictEqual(component.title, 'test');

    await a11yAudit(this.element);
  });
});
