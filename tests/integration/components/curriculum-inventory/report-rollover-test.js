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
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
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
    assert.equal(component.programs.text, 'Program: program 0');
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
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
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
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
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
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
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

  test('rollover report with new name, description, year and program', async function (assert) {
    assert.expect(11);
    const school = this.server.create('school');
    const program = this.server.create('program', { school, title: 'doctor of rocket surgery' });
    const otherProgram = this.server.create('program', { school, title: 'doktor eisenbart' });
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
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
        assert.equal(data.program, otherProgram.id);

        return this.serialize(
          schema.curriculumInventoryReports.create({
            id: 14,
          })
        );
      }
    );

    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportRollover @report={{this.report}} @visit={{(noop)}} />`
    );

    await component.name.set(newName);
    await component.description.set(newDescription);
    await component.years.select(newYear);
    assert.equal(component.programs.options.length, 2);
    assert.equal(component.programs.options[0].text, program.title);
    assert.ok(component.programs.options[0].isSelected);
    assert.equal(component.programs.options[1].text, otherProgram.title);
    assert.notOk(component.programs.options[1].isSelected);
    await component.programs.select(otherProgram.id);
    await component.save();
  });

  test('no input validation errors are shown initially', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{this.report}} />`);
    assert.notOk(component.name.hasValidationError);
  });

  test('input validation fails on blank report name', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{this.report}} />`);

    await component.name.set('');
    await component.save();
    assert.ok(component.name.hasValidationError);
  });

  test('input validation fails on blank description', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      program,
      description: 'lorem ipsum',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(hbs`<CurriculumInventory::ReportRollover @report={{this.report}} />`);
    assert.notOk(component.description.hasValidationError);
    await component.description.set('');
    await component.save();
    assert.ok(component.description.hasValidationError);
  });
});
