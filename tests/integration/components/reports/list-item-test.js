import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios/tests/pages/components/reports/list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    const report = this.server.create('report', {
      title: null,
      subject: 'course',
      user: this.user,
    });

    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('decoratedReport', {
      report: reportModel,
      title: 'this report',
      type: 'subject',
    });

    await render(hbs`<Reports::ListItem
      @decoratedReport={{this.decoratedReport}}
      @confirmRemoval={{(noop)}}
    />`);

    assert.strictEqual(component.title, 'this report');
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });
});
