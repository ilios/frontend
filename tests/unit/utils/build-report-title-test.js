import buildReportTitle from 'ilios/utils/build-report-title';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Utility | build-report-title', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('custom title', async function (assert) {
    const report = this.server.create('report', {
      title: 'Lorem Ipsum',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.find('report', report.id);
    const title = await buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, report.title);
  });

  test('all competencies in all schools', async function (assert) {
    const report = this.server.create('report', {
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.find('report', report.id);
    const title = await buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'All Competencies in All Schools');
  });

  test('all competencies in school X', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.find('report', report.id);
    const title = await buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'All Competencies in ' + school.title);
  });

  test('all competencies for user X in school Y', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const user = this.server.create('user', {
      firstName: 'Chip',
      lastName: 'Whitley',
    });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: user.id,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.find('report', report.id);
    const userModel = await store.find('user', user.id);
    const title = await buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'All Competencies for ' + userModel.fullName + ' in ' + school.title);
  });

  test('broken report', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: 13,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.find('report', report.id);
    const title = await buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'This report is no longer available.');
  });
});
