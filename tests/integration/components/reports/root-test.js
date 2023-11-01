import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios/tests/pages/components/reports/root';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/root', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    this.server.create('report', {
      title: null,
      subject: 'course',
      user: this.user,
    });
    this.server.create('report', {
      title: null,
      subject: 'session',
      user: this.user,
    });

    await render(hbs`<Reports::Root
      @sortReportsBy="title"
      @setSortReportsBy={{(noop)}}
      @titleFilter=""
      @changeTitleFilter={{(noop)}}
    />`);

    assert.strictEqual(component.list.reports.length, 2);
    assert.strictEqual(component.list.reports[0].title, 'All Courses in All Schools');
    assert.strictEqual(component.list.reports[1].title, 'All Sessions in All Schools');

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<Reports::Root
      @sortReportsBy="title"
      @setSortReportsBy={{(noop)}}
      @titleFilter=""
      @changeTitleFilter={{(noop)}}
    />`);
    assert.ok(component.list.emptyListRow.isVisible);
    a11yAudit(this.element);
  });

  test('toggle new report form', async function (assert) {
    await render(hbs`<Reports::Root
      @sortReportsBy="title"
      @setSortReportsBy={{(noop)}}
      @titleFilter=""
      @changeTitleFilter={{(noop)}}
    />`);
    assert.notOk(component.newSubject.isVisible);
    await component.toggleNewSubjectReportForm();
    assert.ok(component.newSubject.isVisible);
    await component.toggleNewSubjectReportForm();
    assert.notOk(component.newSubject.isVisible);
  });
});
