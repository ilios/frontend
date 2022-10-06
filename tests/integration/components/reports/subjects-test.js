import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios/tests/pages/components/reports/subjects';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/subjects', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    assert.expect(4);
    const course = this.server.create('course');
    const session = this.server.create('session', {
      course,
    });
    this.server.create('report', {
      title: 'report 0',
      subject: 'courses',
      user: this.user,
    });
    this.server.create('report', {
      title: 'report 1',
      subject: 'courses',
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: session.id,
      user: this.user,
    });
    await render(hbs`<Reports::Subjects />`);
    assert.strictEqual(component.title, 'Subject Reports');
    assert.strictEqual(component.reports.length, 2);
    assert.strictEqual(component.reports[0].title, 'report 0');
    assert.strictEqual(component.reports[1].title, 'report 1');
    a11yAudit(this.element);
  });

  test('it renders empty', async function (assert) {
    assert.expect(3);
    await render(hbs`<Reports::Subjects />`);
    assert.strictEqual(component.title, 'Subject Reports');
    assert.strictEqual(component.reports.length, 1);
    assert.strictEqual(component.reports[0].text, 'None');
    a11yAudit(this.element);
  });

  test('toggle new report form', async function (assert) {
    await render(hbs`<Reports::Subjects />`);
    assert.notOk(component.newReport.isVisible);
    await component.newReportFormToggle.click();
    assert.ok(component.newReport.isVisible);
    await component.newReportFormToggle.click();
    assert.notOk(component.newReport.isVisible);
  });
});
