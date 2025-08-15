import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/curriculum-inventory-report-rollover';
import queryString from 'query-string';
import { DateTime } from 'luxon';

module('Acceptance | curriculum inventory report/rollover', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
  });

  test('rollover button hidden on rollover route', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(currentRouteName(), 'curriculum-inventory-report.rollover');
    assert.notOk(page.details.overview.rolloverLink.isVisible);
  });

  test('rollover', async function (assert) {
    assert.expect(6);
    this.user.update({ directedSchools: [this.school] });
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: thisYear,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    this.server.post(
      `/api/curriculuminventoryreports/:id/rollover`,
      function (schema, { params, requestBody }) {
        assert.ok('id' in params);
        assert.strictEqual(params.id, reportModel.id);
        const data = queryString.parse(requestBody);
        assert.strictEqual(parseInt(data.year, 10), thisYear + 1);
        assert.strictEqual(data.name, reportModel.name);
        assert.strictEqual(data.description, reportModel.description);
        return this.serialize(
          schema.curriculumInventoryReports.create({
            id: reportModel.id + 1,
            programId: program.id,
            year: data.year,
            name: data.name,
            description: data.description,
          }),
        );
      },
    );

    await page.visit({ reportId: reportModel.id });
    await page.rollover.save();
    assert.strictEqual(currentURL(), `/curriculum-inventory-reports/${reportModel.id + 1}`);
  });
});
