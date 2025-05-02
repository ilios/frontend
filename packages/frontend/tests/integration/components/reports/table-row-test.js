import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/table-row';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/table-row', function (hooks) {
  setupRenderingTest(hooks);
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

    await render(
      hbs`<Reports::TableRow @decoratedReport={{this.decoratedReport}} @reportsForRemovalConfirmation={{(array)}} @confirmRemoval={{(noop)}} />`,
    );

    assert.strictEqual(component.title, 'this report');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
