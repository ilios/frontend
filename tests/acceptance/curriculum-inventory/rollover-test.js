import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-report-rollover';

module('Acceptance | curriculum inventory report/rollover', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('rollover button hidden on rollover route', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculumInventoryReport', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(currentRouteName(), 'curriculum-inventory-report.rollover');
    assert.notOk(page.details.overview.rolloverLink.isVisible);
  });
});
