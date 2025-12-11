import Service from '@ember/service';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click, find, findAll, fillIn, blur as emberBlur } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import queryString from 'query-string';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import Rollover from 'ilios-common/components/course/rollover';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | course/rollover', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(() => {
    unfreezeDate();
  });

  const earliestRolloverYear = (jsDate) => {
    let { month, year } = DateTime.fromJSDate(jsDate);
    year--; // start with the previous year
    if (month < 7) {
      // before July 1st (start of a new academic year) show the year before
      year--;
    }
    return year;
  };

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const firstYear = earliestRolloverYear(new Date());
    const yearSelect = '.year-select select';
    const title = '.title input';

    for (let i = 0; i < 6; i++) {
      assert.dom(`${yearSelect} option:nth-of-type(${i + 1})`).hasText(`${firstYear + i}`);
    }
    assert.dom(title).exists({ count: 1 });
    assert.strictEqual(find(title).value.trim(), course.title);
  });

  test('it renders all expected cohorts', async function (assert) {
    const december11th2025 = DateTime.fromObject({
      year: 2025,
      month: 12,
      day: 11,
      hour: 8,
    });
    freezeDateAt(december11th2025.toJSDate());
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    for (let startYear = 2025; startYear < 2029; startYear++) {
      const programYear = this.server.create('program-year', {
        program,
        startYear,
      });
      this.server.create('cohort', {
        title: startYear,
        programYear,
      });
    }
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const cohorts = '.cohorts .selectable-cohorts li';
    assert.dom(cohorts).exists({ count: 4 });
    assert.dom(`${cohorts}:nth-child(1)`).includesText('2028');
    assert.dom(`${cohorts}:nth-child(2)`).includesText('2027');
    assert.dom(`${cohorts}:nth-child(3)`).includesText('2026');
    assert.dom(`${cohorts}:nth-child(4)`).includesText('2025');
  });

  test('academic year options are labeled with year ranges as applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const firstYear = earliestRolloverYear(new Date());
    const yearSelect = '.year-select select';
    for (let i = 0; i < 6; i++) {
      assert
        .dom(`${yearSelect} option:nth-of-type(${i + 1})`)
        .hasText(`${firstYear + i} - ${firstYear + i + 1}`);
    }
  });

  test('rollover course', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old title',
      school,
      startDate: courseStartDate.toFormat('yyyy-MM-dd'),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const firstYear = earliestRolloverYear(new Date());
      const data = queryString.parse(request.requestBody);
      assert.ok('year' in data);
      assert.strictEqual(parseInt(data.year, 10), firstYear);
      assert.strictEqual(data.newCourseTitle, course.title);
      assert.ok('newStartDate' in data);
      assert.strictEqual(courseStartDate.toFormat('yyyy-LL-dd'), data.newStartDate);
      return this.serialize(
        schema.courses.create({
          id: 14,
          title: data.newCourseTitle,
          startDate: data.newStartDate,
          year: data.year,
        }),
      );
    });
    this.set('visit', (newCourse) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newCourse.id, 10), 14);
    });
    await render(<template><Rollover @course={{this.course}} @visit={{this.visit}} /></template>);
    await click('.done');
    assert.verifySteps(['API called', 'visit called']);
  });

  test('rollover course with new title', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old title',
      school,
      startDate: DateTime.fromObject({ hour: 0, minute: 0, second: 0 }).toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    const newTitle = course.title + '2';

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const data = queryString.parse(request.requestBody);
      assert.strictEqual(data.newCourseTitle, newTitle, 'The new title gets passed.');

      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    const title = '.title';
    const input = `${title} input`;
    await fillIn(input, newTitle);
    await click('.done');
    assert.verifySteps(['API called']);
  });

  test('rollover course to selected year', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old title',
      school,
      startDate: DateTime.fromObject({ hour: 0, minute: 0, second: 0 }).toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    const selectedYear = DateTime.now().plus({ year: 2 }).year;
    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const data = queryString.parse(request.requestBody);
      assert.ok('year' in data);
      assert.strictEqual(parseInt(data.year, 10), selectedYear);
      assert.strictEqual(data.newCourseTitle, course.title);
      assert.ok('newStartDate' in data);
      return this.serialize(
        schema.courses.create({
          id: 14,
          title: data.newCourseTitle,
          startDate: data.newStartDate,
          year: data.year,
        }),
      );
    });
    this.set('visit', (newCourse) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newCourse.id, 10), 14);
    });
    await render(<template><Rollover @course={{this.course}} @visit={{this.visit}} /></template>);
    await fillIn('[data-test-year]', selectedYear);

    await click('.done');
    assert.verifySteps(['API called', 'visit called']);
  });

  test('disable years when title already exists', async function (assert) {
    const title = 'to be rolled';
    const firstYear = earliestRolloverYear(new Date());
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title,
      school,
      year: firstYear - 1,
    });
    this.server.create('course', {
      id: 2,
      school,
      title,
      year: firstYear,
    });
    this.server.create('course', {
      id: 3,
      school,
      title,
      year: firstYear + 2,
    });

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);

    let options = findAll('select:nth-of-type(1) option');
    assert.ok(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.ok(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);

    await fillIn('[data-test-title]', 'new title');
    options = findAll('select:nth-of-type(1) option');
    assert.notOk(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.notOk(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);

    await fillIn('[data-test-title]', title + ' ');
    options = findAll('select:nth-of-type(1) option');
    assert.ok(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.ok(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);
  });

  test('rollover into same year with title changed #1342', async function (assert) {
    const thisYear = DateTime.now().year;

    const school = this.server.create('school');
    this.server.create('course', {
      id: 2,
      school,
      year: thisYear,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 2);
    this.set('course', courseModel);
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    assert.dom('[data-test-year] option:disabled').exists({ count: 1 });
    await fillIn('[data-test-title]', 'new title');
    assert.dom('[data-test-year] option:disabled').doesNotExist();
  });

  test('rollover course with new start date', async function (assert) {
    const currentYear = DateTime.now().year;
    // ensure that rollover date and course start date fall on the same day of the week.
    const courseStartDate = DateTime.fromISO(`${currentYear}-W20-1`);
    const rolloverDate = courseStartDate.plus({ week: 1 });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
      startDate: courseStartDate.toFormat('yyyy-MM-dd'),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const data = queryString.parse(request.requestBody);
      assert.ok('newStartDate' in data, 'A new start date was passed.');
      const newStartDate = DateTime.fromFormat(data.newStartDate, 'y-MM-dd');
      assert.ok(rolloverDate.hasSame(newStartDate, 'day'), 'New start date is rollover date.');
      assert.strictEqual(rolloverDate.toFormat('yyyy-LL-dd'), data.newStartDate);

      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    const advancedOptions = '.advanced-options';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;
    await fillIn('[data-test-year]', courseStartDate.year);

    await click(startDate);
    const picker = find('[data-test-date-picker]')._flatpickr;
    assert.strictEqual(
      picker.currentYear,
      courseStartDate.year,
      'Selected year initialized to course start date year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      courseStartDate.month,
      'Selected month initialized to course start date month.',
    );
    picker.setDate(rolloverDate.toJSDate(), true);
    assert.strictEqual(
      picker.currentYear,
      rolloverDate.year,
      'Selected year changed to rollover date year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      rolloverDate.month,
      'Selected month changed to rollover date month.',
    );
    assert.strictEqual(
      picker.selectedDates[0].getDate(),
      rolloverDate.day,
      'Selected day changed to rollover date day.',
    );
    await click('.done');
    assert.verifySteps(['API called']);
  });

  test('rollover course prohibit non-matching day-of-week date selection', async function (assert) {
    const currentYear = DateTime.now().year;
    // rollover date and course start date don't fall on the same day of the week.
    const courseStartDate = DateTime.fromISO(`${currentYear}-W20-1`);
    const rolloverDate = courseStartDate.plus({ week: 1 }).set({ weekday: 3 });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'test title',
      school,
      startDate: courseStartDate.toFormat('yyyy-MM-dd'),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const data = queryString.parse(request.requestBody);
      assert.ok('newStartDate' in data, 'A new start date was passed.');
      const newStartDate = DateTime.fromFormat(data.newStartDate, 'y-MM-dd');

      assert.ok(
        courseStartDate.hasSame(newStartDate, 'day'),
        'New start date is course start date.',
      );
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });

    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    const advancedOptions = '.advanced-options';
    const yearSelect = '.year-select select';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await fillIn(yearSelect, courseStartDate.year);
    await emberBlur(yearSelect);

    await click(startDate);
    const picker = find('[data-test-date-picker]')._flatpickr;
    picker.setDate(rolloverDate.toJSDate(), true);
    assert.strictEqual(
      picker.currentYear,
      courseStartDate.year,
      'Selected year initialized to course start date year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      courseStartDate.month,
      'Selected month initialized to course start date month.',
    );
    await click('.done');
    assert.verifySteps(['API called']);
  });

  /**
   * This tests wonky business logic where the targeted rollover start date gets adjusted to a date in the current year
   * if the given course has a start date in a former year.
   */
  test('rollover start date adjustment with former year course start date', async function (assert) {
    const courseStartDate = DateTime.fromObject({
      year: 2017,
      month: 1,
      day: 16,
      hour: 0,
      minute: 0,
    });
    const rolloverDate = DateTime.fromObject({
      hour: 0,
      minute: 0,
    }).set({ weekNumber: courseStartDate.weekNumber, weekday: courseStartDate.weekday });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
      startDate: courseStartDate.toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    const advancedOptions = '.advanced-options';
    const yearSelect = '.year-select select';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await fillIn(yearSelect, rolloverDate.year);
    await emberBlur(yearSelect);

    await click(startDate);
    const picker = find('[data-test-date-picker]')._flatpickr;
    assert.strictEqual(
      picker.currentYear,
      rolloverDate.year,
      'Selected year initialized to this year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      rolloverDate.month,
      "Selected month initialized to this year's equivalent of course's start month.",
    );
  });

  test('rollover course with no offerings', async function (assert) {
    const school = this.server.create('school', {
      title: 'SOM',
    });
    this.server.create('course', {
      title: 'old course',
      school,
    });
    const course = await this.owner.lookup('service:store').findRecord('course', 1);
    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const data = queryString.parse(request.requestBody, {
        parseBooleans: true,
      });
      assert.ok('skipOfferings' in data);
      assert.true(data.skipOfferings);
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });

    this.set('course', course);
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    const advancedOptions = '.advanced-options';
    const offerings = `${advancedOptions} [data-test-skip-offerings]`;

    assert.dom(offerings).isChecked();
    await click(offerings);
    assert.dom(offerings).isNotChecked();
    await click('.done');
    assert.verifySteps(['API called']);
  });

  test('errors do not show up initially', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('errors show up', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const title = '.title';
    const input = `${title} input`;

    await fillIn(input, '');
    await emberBlur(input);
    assert.dom('.validation-error-message').exists({ count: 1 });
    assert.ok(find('.validation-error-message').textContent.includes('too short'));
  });

  test('rollover course with cohorts', async function (assert) {
    const school = this.server.create('school', {
      title: 'SOM',
    });
    const program = this.server.create('program', {
      title: 'SOM',
      school,
    });
    const startYear = new Date().getFullYear();
    const programYear = this.server.create('program-year', {
      program,
      published: true,
      archived: false,
      startYear,
    });
    this.server.create('cohort', {
      programYear,
    });
    this.server.create('course', {
      title: 'old course',
      school,
    });
    const course = await this.owner.lookup('service:store').findRecord('course', 1);
    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      assert.step('API called');
      const data = queryString.parse(request.requestBody, {
        arrayFormat: 'bracket',
      });
      assert.ok('newCohorts' in data, 'newCohorts key found in rollover found in posted data');
      assert.deepEqual(data.newCohorts, ['1'], 'posted data correct');
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });

    class CurrentUserMock extends Service {
      model = resolve({});
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    this.set('course', course);
    await render(<template><Rollover @course={{this.course}} @visit={{(noop)}} /></template>);
    const advancedOptions = '.advanced-options';
    const selectedCohorts = `${advancedOptions} .selected-cohorts`;
    assert.dom(selectedCohorts).doesNotExist();
    const firstCohort = `${advancedOptions} .selectable-cohorts li:nth-of-type(1) button`;

    await click(firstCohort);
    assert.dom(selectedCohorts).exists();
    await click('.done');

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
    assert.verifySteps(['API called']);
  });

  test('dates are correct in December', async function (assert) {
    const december11th2024 = DateTime.fromObject({
      year: 2024,
      month: 12,
      day: 11,
      hour: 8,
    });
    freezeDateAt(december11th2024.toJSDate());
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const yearSelect = '.year-select select';
    const title = '.title input';

    const years = [2023, 2024, 2025, 2026, 2027, 2028];
    years.forEach((year, i) => {
      assert.dom(`${yearSelect} option:nth-of-type(${i + 1})`).hasText(year.toString());
    });
    assert.strictEqual(find(title).value.trim(), course.title);
  });

  test('dates are correct in January', async function (assert) {
    const january1st2025 = DateTime.fromObject({
      year: 2025,
      month: 1,
      day: 1,
      hour: 8,
    });
    freezeDateAt(january1st2025.toJSDate());
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const yearSelect = '.year-select select';
    const title = '.title input';

    const years = [2023, 2024, 2025, 2026, 2027, 2028];
    years.forEach((year, i) => {
      assert.dom(`${yearSelect} option:nth-of-type(${i + 1})`).hasText(year.toString());
    });
    assert.strictEqual(find(title).value.trim(), course.title);
  });

  test('dates are correct in June', async function (assert) {
    const june30th2025 = DateTime.fromObject({
      year: 2025,
      month: 6,
      day: 30,
      hour: 8,
    });
    freezeDateAt(june30th2025.toJSDate());
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const yearSelect = '.year-select select';
    const title = '.title input';

    const years = [2023, 2024, 2025, 2026, 2027, 2028];
    years.forEach((year, i) => {
      assert.dom(`${yearSelect} option:nth-of-type(${i + 1})`).hasText(year.toString());
    });
    assert.strictEqual(find(title).value.trim(), course.title);
  });

  test('dates are correct in July', async function (assert) {
    const july1st2025 = DateTime.fromObject({
      year: 2025,
      month: 7,
      day: 1,
      hour: 8,
    });
    freezeDateAt(july1st2025.toJSDate());
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Rollover @course={{this.course}} /></template>);

    const yearSelect = '.year-select select';
    const title = '.title input';

    const years = [2024, 2025, 2026, 2027, 2028, 2029];
    years.forEach((year, i) => {
      assert.dom(`${yearSelect} option:nth-of-type(${i + 1})`).hasText(year.toString());
    });
    assert.strictEqual(find(title).value.trim(), course.title);
  });
});
