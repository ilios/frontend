import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/report-overview';

module('Integration | Component | curriculum-inventory/report-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const currentYear = DateTime.fromObject({ hour: 8 }).year;
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    this.program = this.server.create('program', {
      school,
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });
    this.report = this.server.create('curriculumInventoryReport', {
      academicLevels,
      year: currentYear.toString(),
      program: this.program,
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: DateTime.fromObject({ year: currentYear - 1, month: 6, day: 12 }).toJSDate(),
      endDate: DateTime.fromObject({ year: currentYear, month: 4, day: 11 }).toJSDate(),
      description: 'Lorem Ipsum',
    });
    this.permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return true;
      },
    });
    this.owner.register('service:permission-checker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(component.title, 'Overview', 'Component title is visible.');
    assert.ok(component.rolloverLink.isVisible, 'Rollover course button is visible.');
    assert.ok(component.verificationPreviewLink.isVisible, 'Verification preview link is visible.');
    assert.strictEqual(component.startDate.label, 'Start:', 'Start date label is correct.');
    assert.strictEqual(
      component.startDate.text,
      this.intl.formatDate(reportModel.startDate),
      'Start date is visible.',
    );
    assert.strictEqual(component.endDate.label, 'End:', 'End date label is correct.');
    assert.strictEqual(
      component.endDate.text,
      this.intl.formatDate(reportModel.endDate),
      'End date is visible.',
    );
    assert.strictEqual(
      component.academicYear.label,
      'Academic Year:',
      'Academic year label is correct.',
    );
    assert.strictEqual(component.academicYear.text, reportModel.year, 'Academic year is visible.');
    assert.strictEqual(component.program.label, 'Program:', 'Program label is correct.');
    assert.strictEqual(
      component.program.text,
      `${programModel.title} (${programModel.shortTitle})`,
      'Program is visible.',
    );
    assert.strictEqual(
      component.description.label,
      'Description:',
      'Description label is correct.',
    );
    assert.strictEqual(
      component.description.text,
      reportModel.description,
      'Description is visible.',
    );
  });

  test('read-only', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{false}} />`,
    );
    assert.strictEqual(
      component.startDate.readOnlyText,
      this.intl.formatDate(reportModel.startDate),
      'Start date is visible.',
    );
    assert.strictEqual(
      component.endDate.readOnlyText,
      this.intl.formatDate(reportModel.endDate),
      'End date is visible.',
    );
    assert.strictEqual(
      component.academicYear.readOnlyText,
      reportModel.year,
      'Academic year is visible.',
    );
    assert.strictEqual(
      component.program.text,
      `${programModel.title} (${programModel.shortTitle})`,
      'Program is visible.',
    );
    assert.strictEqual(
      component.description.readOnlyText,
      reportModel.description,
      'Description is visible.',
    );
  });

  test('academic-year selector options are labeled with year range if applicable by configuration', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(
      component.academicYear.text,
      `${reportModel.year} - ` + (parseInt(reportModel.year, 10) + 1),
    );
  });

  test('report year is labeled as range in read-only mode if applicable by configuration', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{false}} />`,
    );
    assert.strictEqual(
      component.academicYear.readOnlyText,
      `${reportModel.year} - ` + (parseInt(reportModel.year, 10) + 1),
    );
  });

  test('rollover button not visible for unprivileged user', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.permissionCheckerMock.reopen({
      canCreateCurriculumInventoryReport() {
        return false;
      },
    });
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.notOk(component.rolloverLink.isVisible, 'Rollover course button is not visible.');
  });

  test('change start date', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    await component.startDate.edit();
    assert.strictEqual(
      component.startDate.value,
      this.intl.formatDate(reportModel.startDate),
      "The report's current start date is pre-selected in date picker.",
    );
    const newVal = DateTime.fromJSDate(reportModel.startDate).plus({ days: 1 });
    await component.startDate.set(newVal.toJSDate());
    await component.startDate.save();
    assert.strictEqual(
      component.startDate.text,
      this.intl.formatDate(newVal),
      'Edit link shown new start date post-update.',
    );
    assert.strictEqual(
      this.intl.formatDate(reportModel.startDate),
      this.intl.formatDate(newVal),
      "The report's start date was updated.",
    );
  });

  test('validation fails if given start date follows end date', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    await component.startDate.edit();
    const newVal = DateTime.fromJSDate(reportModel.endDate).plus({ days: 1 });
    assert.notOk(component.startDate.hasError, 'Initially, no validation error is visible.');
    await component.startDate.set(newVal.toJSDate());
    await component.startDate.save();
    assert.ok(component.startDate.hasError, 'Validation failed, error message is visible.');
  });

  test('change end date', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    await component.endDate.edit();
    assert.strictEqual(
      component.endDate.value,
      this.intl.formatDate(reportModel.endDate),
      "The report's current end date is pre-selected in date picker.",
    );
    const newVal = DateTime.fromJSDate(reportModel.endDate).plus({ days: 1 });
    await component.endDate.set(newVal.toJSDate());
    await component.endDate.save();
    assert.strictEqual(
      component.endDate.text,
      this.intl.formatDate(newVal),
      'Edit link shown new end date post-update.',
    );
    assert.strictEqual(
      this.intl.formatDate(reportModel.endDate),
      this.intl.formatDate(newVal),
      "The report's end date was updated.",
    );
  });

  test('validation fails if given end date precedes end date', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    await component.endDate.edit();
    const newVal = DateTime.fromJSDate(reportModel.startDate).minus({ days: 1 });
    assert.notOk(component.endDate.hasError, 'Initially, no validation error is visible.');
    await component.endDate.set(newVal.toJSDate());
    await component.endDate.save();
    assert.ok(component.endDate.hasError, 'Validation failed, error message is visible.');
  });

  test('change academic year', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    await component.academicYear.edit();
    assert.strictEqual(
      component.academicYear.options.length,
      11,
      'There should be ten options in year dropdown.',
    );
    assert.strictEqual(component.academicYear.options[5].text, reportModel.year);
    assert.ok(
      component.academicYear.options[5].isSelected,
      "The report's year should be selected.",
    );
    const newVal = (parseInt(reportModel.year, 10) + 1).toString();
    await component.academicYear.select(newVal);
    await component.academicYear.save();
    assert.strictEqual(component.academicYear.text, newVal, 'New year is visible on edit-link.');
    assert.strictEqual(reportModel.year, newVal, 'Report year got updated with new value.');
  });

  test('academic year unchangeable if course has been linked', async function (assert) {
    const course = this.server.create('course');
    this.server.create('curriculumInventorySequenceBlock', {
      course,
      report: this.report,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(
      component.academicYear.readOnlyText,
      reportModel.year,
      'Academic year is in not editable.',
    );
  });

  test('change description', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    reportModel.description = null;
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(component.description.text, 'Click to edit');
    await component.description.edit();
    const newDescription = 'Quidquid luce fuit, tenebris agit.';
    await component.description.set(newDescription);
    await component.description.save();
    assert.strictEqual(component.description.text, newDescription);
    assert.strictEqual(reportModel.description, newDescription);
  });

  test('description validation fails if text is too long', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    reportModel.description = null;
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(component.description.text, 'Click to edit');
    await component.description.edit();
    assert.notOk(component.description.hasError, 'Validation error is initially not shown.');
    const newDescription = '0123456789'.repeat(5000);
    await component.description.set(newDescription);
    await component.description.save();
    assert.ok(component.description.hasError, 'Validation error message is visible.');
  });

  test('description validation fails if text is empty', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(component.description.text, 'Lorem Ipsum');
    await component.description.edit();
    assert.notOk(component.description.hasError, 'Validation error is initially not shown.');
    await component.description.set('');
    await component.description.save();
    assert.ok(component.description.hasError, 'Validation error message is visible.');
  });

  test('program short title is only displayed if it has a value', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.program.shortTitle = null;
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`,
    );
    assert.strictEqual(component.program.text, 'Doctor of Rocket Surgery');
  });
});
