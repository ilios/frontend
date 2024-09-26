import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/list', function (hooks) {
  setupRenderingTest(hooks);
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

    await render(hbs`<Reports::List
  @sortReportsBy='title'
  @setSortReportsBy={{(noop)}}
  @titleFilter=''
  @changeTitleFilter={{(noop)}}
/>`);

    assert.strictEqual(component.table.reports.length, 2);
    assert.strictEqual(component.table.reports[0].title, 'All Courses in All Schools');
    assert.strictEqual(component.table.reports[1].title, 'All Sessions in All Schools');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<Reports::Root
  @sortReportsBy='title'
  @setSortReportsBy={{(noop)}}
  @titleFilter=''
  @changeTitleFilter={{(noop)}}
/>`);
    assert.notOk(component.table.isVisible);
    a11yAudit(this.element);
  });

  test('toggle new report form', async function (assert) {
    await render(hbs`<Reports::Root
  @sortReportsBy='title'
  @setSortReportsBy={{(noop)}}
  @titleFilter=''
  @changeTitleFilter={{(noop)}}
/>`);
    assert.notOk(component.newSubject.isVisible);
    await component.toggleNewSubjectReportForm();
    assert.ok(component.newSubject.isVisible);
    await component.toggleNewSubjectReportForm();
    assert.notOk(component.newSubject.isVisible);
  });
});
