import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | curriculum inventory report overview', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function() {
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school,
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });
    const report = this.server.create('curriculumInventoryReport', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
    });

    this.report = await this.owner.lookup('service:store').find('curriculum-inventory-report', report.id);
    this.program = await this.owner.lookup('service:store').find('program', program.id);

    this.permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return true;
      }
    });
    this.owner.register('service:permission-checker', this.permissionCheckerMock);


  });

  test('it renders', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    assert.dom('.title').hasText('Overview', 'Component title is visible.');
    assert.dom('.report-overview-actions .verification-preview').exists({ count: 1 }, 'Rollover course button is visible.');
    assert.dom('.report-overview-actions .rollover').exists({ count: 1 }, 'Verification preview link is visible.');
    assert.dom('.start-date label').hasText('Start:', 'Start date label is correct.');
    assert.dom('.start-date .editinplace').hasText(this.intl.formatDate(this.report.startDate), 'Start date is visible.');
    assert.dom('.end-date label').hasText('End:', 'End date label is correct.');
    assert.dom('.end-date .editinplace').hasText(this.intl.formatDate(this.report.endDate), 'End date is visible.');
    assert.dom('.academic-year label').hasText('Academic Year:', 'Academic year label is correct.');
    assert.dom('.academic-year .editinplace').hasText(this.report.year, 'Academic year is visible.');
    assert.dom('.program label').hasText('Program:', 'Program label is correct.');
    assert.dom('.program > span').hasText(`${this.program.title} (${this.program.shortTitle})`, 'Program is visible.');
    assert.dom('.description label').hasText('Description:', 'Description label is correct.');
    assert.dom('.description .editinplace').hasText(this.report.description, 'Description is visible.');
  });

  test('read-only', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{false}} />`);

    assert.dom('.start-date > span').hasText(this.intl.formatDate(this.report.startDate), 'Start date is visible.');
    assert.dom('.end-date > span').hasText(this.intl.formatDate(this.report.endDate), 'End date is visible.');
    assert.dom('.academic-year > span').hasText(this.report.year, 'Academic year is visible.');
    assert.dom('.program > span').hasText(`${this.program.title} (${this.program.shortTitle})`, 'Program is visible.');
    assert.dom('.description > span').hasText(this.report.description, 'Description is visible.');
  });

  test('academic-year selector options are labeled with year range if applicable by configuration', async function(assert) {
    this.server.get('application/config', function() {
      return { config: {
        academicYearCrossesCalendarYearBoundaries: true,
      }};
    });
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);
    assert.dom('.academic-year .editinplace ').hasText(`${this.report.year} - ` + (parseInt(this.report.year, 10) + 1));
    await click('.academic-year .editinplace .editable');
  });

  test('report year is labeled as range in read-only mode if applicable by configuration', async function(assert) {
    this.server.get('application/config', function() {
      return { config: {
        academicYearCrossesCalendarYearBoundaries: true,
      }};
    });

    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{false}} />`);

    assert.dom('.academic-year > span').hasText(`${this.report.year} - ` + (parseInt(this.report.year, 10) + 1));
  });

  test('rollover button not visible for unprivileged user', async function(assert) {
    this.permissionCheckerMock.reopen({
      canCreateCurriculumInventoryReport() {
        return false;
      }
    });
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);
    assert.dom('.report-overview-actions .rollover').doesNotExist('Rollover course button is not visible.');
  });

  test('change start date', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    await click('.start-date .editinplace .editable');
    assert.dom('.start-date input').hasValue(
      this.intl.formatDate(this.report.startDate),
      "The report's current start date is pre-selected in date picker."
    );
    const newVal = moment('2015-04-01');
    await click('.start-date input');
    const picker = find('[data-test-start-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    await click('.start-date .actions .done');
    assert.dom('.start-date .editinplace').hasText(this.intl.formatDate(newVal), 'Edit link shown new start date post-update.');
    assert.equal(this.intl.formatDate(this.report.startDate), this.intl.formatDate(newVal),
      "The report's start date was updated."
    );
  });

  test('validation fails if given start date follows end date', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    await click('.start-date .editinplace .editable');
    await click('.start-date input');
    const newVal = moment(this.report.endDate).add(1, 'day');
    const picker = find('[data-test-start-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    assert.dom('.start-date .validation-error-message').doesNotExist('Initially, no validation error is visible.');
    await click('.start-date .actions .done');
    assert.dom('.start-date .validation-error-message').exists({ count: 1 }, 'Validation failed, error message is visible.');
  });

  test('change end date', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    await click('.end-date .editinplace .editable');
    await click('.end-date input');
    assert.dom('.end-date input').hasValue(
      this.intl.formatDate(this.report.endDate),
      "The report's current end date is pre-selected in date picker."
    );
    const newVal = moment('2016-05-01');
    const picker = find('[data-test-end-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    await click('.end-date .actions .done');
    assert.dom('.end-date .editinplace').hasText(this.intl.formatDate(newVal), 'Edit link shown new end date post-update.');
    assert.equal(moment(this.report.get('endDate')).format('YYYY-MM-DD'), newVal.format('YYYY-MM-DD'),
      "The report's end date was updated."
    );
  });

  test('validation fails if given end date precedes end date', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    await click('.end-date .editinplace .editable');
    await click('.end-date input');
    const newVal = moment(this.report.startDate).subtract(1, 'day');
    const picker = find('[data-test-end-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    assert.dom('.end-date .validation-error-message').doesNotExist('Initially, no validation error is visible.');
    await click('.end-date .actions .done');
    assert.dom('.end-date .validation-error-message').exists({ count: 1 }, 'Validation failed, error message is visible.');
  });

  test('change academic year', async function(assert) {
    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    await click('.academic-year .editinplace .editable');
    assert.dom('.academic-year option').exists({ count: 11 }, 'There should be ten options in year dropdown.');
    assert.dom('.academic-year option:checked').hasValue(this.report.year, "The report's year should be selected.");
    const newVal = parseInt(this.report.year, 10) + 1;
    await fillIn('.academic-year select', newVal);
    await click('.academic-year .actions .done');
    assert.dom('.academic-year .editinplace').hasText(newVal.toString(), 'New year is visible on edit-link.');
    assert.equal(this.report.year, newVal.toString(), 'Report year got updated with new value.');
  });

  test('academic year unchangeable if course has been linked', async function(assert) {
    const course = this.server.create('course');
    const sequenceBlock = this.server.create('curriculumInventorySequenceBlock', { course, reportId: this.report.id });
    const sequenceBlockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', sequenceBlock.id);
    this.report.sequenceBlocks.pushObject(sequenceBlockModel);

    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    assert.dom('.academic-year > span').hasText(this.report.year, 'Academic year is visible.');
    assert.dom('.academic-year .editinplace').doesNotExist('Academic year is not editable in place.');
  });

  test('change description', async function(assert) {
    this.report.description = null;

    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    assert.dom('.description .editinplace').hasText('Click to edit');
    await click('.description .editinplace .editable');
    const newDescription = 'Quidquid luce fuit, tenebris agit.';
    await fillIn('.description textarea', newDescription);
    await click('.description .actions .done');
    assert.dom('.description .editinplace').hasText(newDescription);
    assert.equal(this.report.description, newDescription);
  });

  test('description validation fails if text is too long', async function(assert) {
    this.report.description = null;

    await render(hbs`<CurriculumInventoryReportOverview @report={{this.report}} @canUpdate={{true}} />`);

    assert.dom('.description .editinplace').hasText('Click to edit');
    await click('.description .editinplace .editable');
    assert.dom('.description .validation-error-message').doesNotExist('Validation error is initially not shown.');
    const newDescription = '0123456789'.repeat(5000);
    await fillIn('.description textarea', newDescription);
    await click('.description .actions .done');
    assert.dom('.description .validation-error-message').exists({count: 1}, 'Validation error message is visible.');
  });
});
