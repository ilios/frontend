import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/report-overview';

module('Integration | Component | curriculum-inventory/report-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const currentYear = new Date().getFullYear();
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school,
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });
    const report = this.server.create('curriculumInventoryReport', {
      academicLevels,
      year: currentYear.toString(),
      program,
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment(`${currentYear - 1}-06-12`).toDate(),
      endDate: moment(`${currentYear}-04-11`).toDate(),
      description: 'Lorem Ipsum',
    });

    this.report = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.program = await this.owner.lookup('service:store').find('program', program.id);

    this.permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return true;
      },
    });
    this.owner.register('service:permission-checker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    assert.equal(component.title, 'Overview', 'Component title is visible.');
    assert.ok(component.rolloverLink.isVisible, 'Rollover course button is visible.');
    assert.ok(component.verificationPreviewLink.isVisible, 'Verification preview link is visible.');
    assert.equal(component.startDate.label, 'Start:', 'Start date label is correct.');
    assert.equal(
      component.startDate.text,
      this.intl.formatDate(this.report.startDate),
      'Start date is visible.'
    );
    assert.equal(component.endDate.label, 'End:', 'End date label is correct.');
    assert.equal(
      component.endDate.text,
      this.intl.formatDate(this.report.endDate),
      'End date is visible.'
    );
    assert.equal(component.academicYear.label, 'Academic Year:', 'Academic year label is correct.');
    assert.equal(component.academicYear.text, this.report.year, 'Academic year is visible.');
    assert.equal(component.program.label, 'Program:', 'Program label is correct.');
    assert.equal(
      component.program.text,
      `${this.program.title} (${this.program.shortTitle})`,
      'Program is visible.'
    );
    assert.equal(component.description.label, 'Description:', 'Description label is correct.');
    assert.equal(component.description.text, this.report.description, 'Description is visible.');
  });

  test('read-only', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{false}} />`
    );

    assert.equal(
      component.startDate.readOnlyText,
      this.intl.formatDate(this.report.startDate),
      'Start date is visible.'
    );
    assert.equal(
      component.endDate.readOnlyText,
      this.intl.formatDate(this.report.endDate),
      'End date is visible.'
    );
    assert.equal(
      component.academicYear.readOnlyText,
      this.report.year,
      'Academic year is visible.'
    );
    assert.equal(
      component.program.text,
      `${this.program.title} (${this.program.shortTitle})`,
      'Program is visible.'
    );
    assert.equal(
      component.description.readOnlyText,
      this.report.description,
      'Description is visible.'
    );
  });

  test('academic-year selector options are labeled with year range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );
    assert.equal(
      component.academicYear.text,
      `${this.report.year} - ` + (parseInt(this.report.year, 10) + 1)
    );
  });

  test('report year is labeled as range in read-only mode if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });

    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{false}} />`
    );
    assert.equal(
      component.academicYear.readOnlyText,
      `${this.report.year} - ` + (parseInt(this.report.year, 10) + 1)
    );
  });

  test('rollover button not visible for unprivileged user', async function (assert) {
    this.permissionCheckerMock.reopen({
      canCreateCurriculumInventoryReport() {
        return false;
      },
    });
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );
    assert.notOk(component.rolloverLink.isVisible, 'Rollover course button is not visible.');
  });

  test('change start date', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    await component.startDate.edit();
    assert.equal(
      component.startDate.value,
      this.intl.formatDate(this.report.startDate),
      "The report's current start date is pre-selected in date picker."
    );
    const newVal = moment(this.report.startDate).add(1, 'day');
    await component.startDate.set(newVal.toDate());
    await component.startDate.save();
    assert.equal(
      component.startDate.text,
      this.intl.formatDate(newVal),
      'Edit link shown new start date post-update.'
    );
    assert.equal(
      this.intl.formatDate(this.report.startDate),
      this.intl.formatDate(newVal),
      "The report's start date was updated."
    );
  });

  test('validation fails if given start date follows end date', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    await component.startDate.edit();
    const newVal = moment(this.report.endDate).add(1, 'day');
    assert.notOk(component.startDate.hasError, 'Initially, no validation error is visible.');
    await component.startDate.set(newVal.toDate());
    await component.startDate.save();
    assert.ok(component.startDate.hasError, 'Validation failed, error message is visible.');
  });

  test('change end date', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    await component.endDate.edit();
    assert.equal(
      component.endDate.value,
      this.intl.formatDate(this.report.endDate),
      "The report's current end date is pre-selected in date picker."
    );
    const newVal = moment(this.report.endDate).add(1, 'day');
    await component.endDate.set(newVal.toDate());
    await component.endDate.save();
    assert.equal(
      component.endDate.text,
      this.intl.formatDate(newVal),
      'Edit link shown new end date post-update.'
    );
    assert.equal(
      this.intl.formatDate(this.report.endDate),
      this.intl.formatDate(newVal),
      "The report's end date was updated."
    );
  });

  test('validation fails if given end date precedes end date', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    await component.endDate.edit();
    const newVal = moment(this.report.startDate).subtract(1, 'day');
    assert.notOk(component.endDate.hasError, 'Initially, no validation error is visible.');
    await component.endDate.set(newVal.toDate());
    await component.endDate.save();
    assert.ok(component.endDate.hasError, 'Validation failed, error message is visible.');
  });

  test('change academic year', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    await component.academicYear.edit();
    assert.equal(
      component.academicYear.options.length,
      11,
      'There should be ten options in year dropdown.'
    );
    assert.equal(component.academicYear.options[5].text, this.report.year);
    assert.ok(
      component.academicYear.options[5].isSelected,
      "The report's year should be selected."
    );
    const newVal = (parseInt(this.report.year, 10) + 1).toString();
    await component.academicYear.select(newVal);
    await component.academicYear.save();
    assert.equal(component.academicYear.text, newVal, 'New year is visible on edit-link.');
    assert.equal(this.report.year, newVal, 'Report year got updated with new value.');
  });

  test('academic year unchangeable if course has been linked', async function (assert) {
    const course = this.server.create('course');
    const sequenceBlock = this.server.create('curriculumInventorySequenceBlock', {
      course,
      report: this.report,
    });
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', sequenceBlock.id);
    this.report.sequenceBlocks.pushObject(sequenceBlockModel);

    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    assert.equal(
      component.academicYear.readOnlyText,
      this.report.year,
      'Academic year is in not editable.'
    );
  });

  test('change description', async function (assert) {
    this.report.description = null;

    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    assert.equal(component.description.text, 'Click to edit');
    await component.description.edit();
    const newDescription = 'Quidquid luce fuit, tenebris agit.';
    await component.description.set(newDescription);
    await component.description.save();
    assert.equal(component.description.text, newDescription);
    assert.equal(this.report.description, newDescription);
  });

  test('description validation fails if text is too long', async function (assert) {
    this.report.description = null;

    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    assert.equal(component.description.text, 'Click to edit');
    await component.description.edit();
    assert.notOk(component.description.hasError, 'Validation error is initially not shown.');
    const newDescription = '0123456789'.repeat(5000);
    await component.description.set(newDescription);
    await component.description.save();
    assert.ok(component.description.hasError, 'Validation error message is visible.');
  });

  test('description validation fails if text is empty', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );

    assert.equal(component.description.text, 'Lorem Ipsum');
    await component.description.edit();
    assert.notOk(component.description.hasError, 'Validation error is initially not shown.');
    await component.description.set('');
    await component.description.save();
    assert.ok(component.description.hasError, 'Validation error message is visible.');
  });

  test('program short title is only displayed if it has a value', async function (assert) {
    this.program.shortTitle = null;
    await render(
      hbs`<CurriculumInventory::ReportOverview @report={{this.report}} @canUpdate={{true}} />`
    );
    assert.equal(component.program.text, 'Doctor of Rocket Surgery');
  });
});
