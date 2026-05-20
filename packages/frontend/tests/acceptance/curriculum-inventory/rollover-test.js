import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/curriculum-inventory-report-rollover';
import { DateTime } from 'luxon';
import formatJsonApi from 'ilios-common/addon-test-support/msw/utils/json-api-formatter';

module('Acceptance | curriculum inventory report/rollover', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school, directedSchools: [this.school] }, true);
  });

  test('rollover button hidden on rollover route', async function (assert) {
    const program = await this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = await this.server.create('curriculum-inventory-report', {
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
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const program = await this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = await this.server.create('curriculum-inventory-report', {
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
      async ({ params, request }) => {
        assert.ok('id' in params);
        assert.strictEqual(params.id, reportModel.id);
        const data = await request.formData();

        assert.strictEqual(Number(data.get('year')), thisYear + 1);
        assert.strictEqual(data.get('name'), reportModel.name);
        assert.strictEqual(data.get('description'), reportModel.description);
        const startDate = DateTime.fromObject({ year: data.get('year'), hour: 8 });

        const newReport = await this.server.create('curriculum-inventory-report', {
          id: Number(reportModel.id) + 1,
          program: program,
          year: Number(data.get('year')),
          name: data.get('name'),
          description: data.get('description'),
          startDate: startDate.toISODate(),
          endDate: startDate.plus({ weeks: 7 }).toISODate(),
        });

        assert.step('API called');
        return formatJsonApi(newReport, 'curriculumInventoryReport');
      },
    );

    await page.visit({ reportId: reportModel.id });
    await page.rollover.save();
    assert.strictEqual(currentURL(), `/curriculum-inventory-reports/${report.id + 1}`);
    assert.verifySteps(['API called']);
  });
});
