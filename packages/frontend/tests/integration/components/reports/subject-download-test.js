import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/subject-download';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/subject-download', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.user = await setupAuthentication();
    //override default handler to just return all courses
    this.server.get('api/courses', (schema) => {
      return schema.courses.all();
    });
  });

  test('it renders', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    this.set('message', this.intl.t('general.reportResultsExceedMax'));
    await render(hbs`<Reports::SubjectDownload
  @report={{this.report}}
  @school={{this.report.school}}
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @fetchDownloadData={{@fetchDownloadData}}
  @readyToDownload={{true}}
  @reportTitleData={{this.reportTitleData}}
/>`);

    assert.notOk(component.message.displays);
    assert.strictEqual(component.button.label, this.intl.t('general.downloadResults'));
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with message', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    this.set('message', this.intl.t('general.reportResultsExceedMax'));
    await render(hbs`<Reports::SubjectDownload
  @report={{this.report}}
  @school={{this.report.school}}
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @fetchDownloadData={{@fetchDownloadData}}
  @readyToDownload={{true}}
  @reportTitleData={{this.reportTitleData}}
  @message={{this.message}}
/>`);

    assert.ok(component.message.displays);
    assert.strictEqual(component.message.text, this.intl.t('general.reportResultsExceedMax'));
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('download is disabled when not ready', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(hbs`<Reports::SubjectDownload
  @report={{this.report}}
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @readyToDownload={{false}}
/>`);
    assert.ok(component.button.isDisabled);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('download enabled', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(hbs`<Reports::SubjectDownload
  @report={{this.report}}
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @readyToDownload={{true}}
/>`);
    assert.notOk(component.button.isDisabled);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
