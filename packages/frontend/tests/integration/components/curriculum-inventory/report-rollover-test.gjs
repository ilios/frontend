import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import queryString from 'query-string';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/report-rollover';
import ReportRollover from 'frontend/components/curriculum-inventory/report-rollover';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | curriculum-inventory/report-rollover', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
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
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);

    assert.strictEqual(component.years.options.length, 4);
    assert.strictEqual(component.years.options[0].text, `${thisYear + 1}`);
    assert.strictEqual(component.years.options[1].text, `${thisYear + 2}`);
    assert.strictEqual(component.years.options[2].text, `${thisYear + 3}`);
    assert.strictEqual(component.years.options[3].text, `${thisYear + 4}`);
    assert.ok(component.years.options[0].isSelected);
    assert.notOk(component.years.options[1].isSelected);
    assert.notOk(component.years.options[2].isSelected);
    assert.notOk(component.years.options[3].isSelected);
    assert.strictEqual(component.name.value, reportModel.name);
    assert.strictEqual(component.description.value, reportModel.description);
    assert.strictEqual(component.programs.text, 'Program: program 0');
  });

  test('multiple target programs, source program is selected by default', async function (assert) {
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const school = this.server.create('school');
    const program = this.server.create('program', { school, title: 'Zeppelin' });
    this.server.createList('program', 3, { school });
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);

    assert.strictEqual(component.programs.options.length, 4);
    assert.strictEqual(component.programs.options[0].text, 'program 1');
    assert.strictEqual(component.programs.options[1].text, 'program 2');
    assert.strictEqual(component.programs.options[2].text, 'program 3');
    assert.strictEqual(component.programs.options[3].text, 'Zeppelin');
    assert.notOk(component.programs.options[0].isSelected);
    assert.notOk(component.programs.options[1].isSelected);
    assert.notOk(component.programs.options[2].isSelected);
    assert.ok(component.programs.options[3].isSelected);
  });

  test('academic years labeled as range if configured accordingly', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
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
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);

    assert.strictEqual(component.years.options.length, 4);
    assert.strictEqual(component.years.options[0].text, `${thisYear + 1} - ${thisYear + 2}`);
    assert.strictEqual(component.years.options[1].text, `${thisYear + 2} - ${thisYear + 3}`);
    assert.strictEqual(component.years.options[2].text, `${thisYear + 3} - ${thisYear + 4}`);
    assert.strictEqual(component.years.options[3].text, `${thisYear + 4} - ${thisYear + 5}`);
  });

  test('rollover report with future year', async function (assert) {
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const sourceYear = thisYear + 1;
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: sourceYear,
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);
    assert.strictEqual(component.years.options.length, 5);
    assert.strictEqual(component.years.options[0].text, `${thisYear}`);
    assert.strictEqual(component.years.options[1].text, `${thisYear + 2}`);
    assert.strictEqual(component.years.options[2].text, `${thisYear + 3}`);
    assert.strictEqual(component.years.options[3].text, `${thisYear + 4}`);
    assert.strictEqual(component.years.options[4].text, `${thisYear + 5}`);
    assert.notOk(component.years.options[0].isSelected);
    assert.ok(
      component.years.options[1].isSelected,
      'the year following the source year is selected.',
    );
    assert.notOk(component.years.options[2].isSelected);
    assert.notOk(component.years.options[3].isSelected);
    assert.notOk(component.years.options[4].isSelected);
  });

  test('rollover report', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    this.server.post(
      `/api/curriculuminventoryreports/:id/rollover`,
      function (schema, { params, requestBody }) {
        assert.step('API called');
        assert.ok('id' in params);
        assert.strictEqual(params.id, reportModel.id);
        const data = queryString.parse(requestBody);
        assert.strictEqual(parseInt(data.year, 10), thisYear + 1);
        assert.strictEqual(data.name, reportModel.name);
        assert.strictEqual(data.description, reportModel.description);

        return this.serialize(
          schema.curriculumInventoryReports.create({
            id: 14,
          }),
        );
      },
    );
    this.set('report', reportModel);
    this.set('visit', (newReport) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newReport.id, 10), 14);
    });
    await render(
      <template><ReportRollover @report={{this.report}} @visit={{this.visit}} /></template>,
    );
    await component.save();
    assert.verifySteps(['API called', 'visit called']);
  });

  test('submit rollover report by pressing enter in name field', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    this.server.post(`/api/curriculuminventoryreports/:id/rollover`, function (schema) {
      assert.step('API called');
      return this.serialize(
        schema.curriculumInventoryReports.create({
          id: 14,
        }),
      );
    });
    this.set('report', reportModel);
    this.set('visit', (newReport) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newReport.id, 10), 14);
    });
    await render(
      <template><ReportRollover @report={{this.report}} @visit={{this.visit}} /></template>,
    );
    await component.name.submit();
    assert.verifySteps(['API called', 'visit called']);
  });

  test('rollover report with new name, description, year and program', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school, title: 'doctor of rocket surgery' });
    const otherProgram = this.server.create('program', { school, title: 'doktor eisenbart' });
    const thisYear = DateTime.fromObject({ hour: 8 }).year;
    const report = this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear,
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    const newName = 'new report';
    const newDescription = 'new description';
    const newYear = thisYear + 4;

    this.server.post(
      `/api/curriculuminventoryreports/:id/rollover`,
      function (schema, { params, requestBody }) {
        assert.step('API called');
        assert.ok('id' in params);
        assert.strictEqual(params.id, report.id);
        const data = queryString.parse(requestBody);
        assert.strictEqual(data.name, newName, 'The new name gets passed.');
        assert.strictEqual(data.description, newDescription, 'The new description gets passed.');
        assert.strictEqual(parseInt(data.year, 10), newYear, 'The new year gets passed.');
        assert.strictEqual(data.program, otherProgram.id);

        return this.serialize(
          schema.curriculumInventoryReports.create({
            id: 14,
          }),
        );
      },
    );

    this.set('report', reportModel);
    await render(<template><ReportRollover @report={{this.report}} @visit={{(noop)}} /></template>);

    await component.name.set(newName);
    await component.description.set(newDescription);
    await component.years.select(newYear);
    assert.strictEqual(component.programs.options.length, 2);
    assert.strictEqual(component.programs.options[0].text, program.title);
    assert.ok(component.programs.options[0].isSelected);
    assert.strictEqual(component.programs.options[1].text, otherProgram.title);
    assert.notOk(component.programs.options[1].isSelected);
    await component.programs.select(otherProgram.id);
    await component.save();
    assert.verifySteps(['API called']);
  });

  test('no input validation errors are shown initially', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);
    assert.notOk(component.name.hasValidationError);
  });

  test('input validation fails on blank report name', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);

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
      .findRecord('curriculum-inventory-report', report.id);
    this.set('report', reportModel);

    await render(<template><ReportRollover @report={{this.report}} /></template>);
    assert.notOk(component.description.hasValidationError);
    await component.description.set('');
    await component.save();
    assert.ok(component.description.hasValidationError);
  });
});
