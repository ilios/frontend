import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import queryString from 'query-string';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/report-rollover';

module('Integration | Component | curriculum-inventory/report-rollover', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{this.report}} />`);

    assert.equal(component.years.options.length, 4);
    assert.equal(component.years.options[0].text, `${thisYear + 1}`);
    assert.equal(component.years.options[1].text, `${thisYear + 2}`);
    assert.equal(component.years.options[2].text, `${thisYear + 3}`);
    assert.equal(component.years.options[3].text, `${thisYear + 4}`);
    assert.equal(component.name.value, reportModel.name);
    assert.equal(component.description.value, reportModel.description);
  });

  test('academic years labeled as range if configured accordingly', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{report}} />`);

    assert.equal(component.years.options.length, 4);
    assert.equal(component.years.options[0].text, `${thisYear + 1} - ${thisYear + 2}`);
    assert.equal(component.years.options[1].text, `${thisYear + 2} - ${thisYear + 3}`);
    assert.equal(component.years.options[2].text, `${thisYear + 3} - ${thisYear + 4}`);
    assert.equal(component.years.options[3].text, `${thisYear + 4} - ${thisYear + 5}`);
  });

  test('rollover report', async function (assert) {
    assert.expect(6);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.server.post(
      `/api/curriculuminventoryreports/:id/rollover`,
      function (schema, { params, requestBody }) {
        assert.ok('id' in params);
        assert.equal(params.id, reportModel.id);
        const data = queryString.parse(requestBody);
        assert.equal(data.year, thisYear + 1);
        assert.equal(data.name, reportModel.name);
        assert.equal(data.description, reportModel.description);

        return this.serialize(
          schema.curriculumInventoryReports.create({
            id: 14,
          })
        );
      }
    );
    this.set('report', reportModel);
    this.set('visit', (newReport) => {
      assert.equal(newReport.id, 14);
    });
    await render(
      hbs`<CurriculumInventory::ReportRollover @report={{this.report}} @visit={{this.visit}} />`
    );
    await component.save();
  });

  test('submit rollover report by pressing enter in name field', async function (assert) {
    assert.expect(1);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.server.post(`/api/curriculuminventoryreports/:id/rollover`, function (schema) {
      return this.serialize(
        schema.curriculumInventoryReports.create({
          id: 14,
        })
      );
    });
    this.set('report', reportModel);
    this.set('visit', (newReport) => {
      assert.equal(newReport.id, 14);
    });
    await render(
      hbs`<CurriculumInventory::ReportRollover @report={{this.report}} @visit={{this.visit}} />`
    );
    await component.name.submit();
  });

  test('rollover report with new name, description and year', async function (assert) {
    assert.expect(5);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    const newName = 'new report';
    const newDescription = 'new description';
    const newYear = thisYear + 4;

    this.server.post(
      `/api/curriculuminventoryreports/:id/rollover`,
      function (schema, { params, requestBody }) {
        assert.ok('id' in params);
        assert.equal(params.id, report.id);
        const data = queryString.parse(requestBody);
        assert.equal(data.name, newName, 'The new name gets passed.');
        assert.equal(data.description, newDescription, 'The new description gets passed.');
        assert.equal(data.year, newYear, 'The new year gets passed.');

        return this.serialize(
          schema.curriculumInventoryReports.create({
            id: 14,
          })
        );
      }
    );

    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportRollover @report={{this.report}} @visit={{noop}} />`
    );

    await component.name.set(newName);
    await component.description.set(newDescription);
    await component.years.select(newYear);
    await component.save();
  });

  test('no input validation errors are shown initially', async function (assert) {
    const report = this.server.create('curriculum-inventory-report');
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{this.report}} />`);
    assert.notOk(component.name.hasValidationError);
  });

  test('input validation fails on blank report name', async function (assert) {
    const report = this.server.create('curriculum-inventory-report');
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{this.report}} />`);

    await component.name.set('');
    await component.save();
    assert.ok(component.name.hasValidationError);
  });
});
