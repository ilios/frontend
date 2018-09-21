import Service from '@ember/service';
import { resolve } from 'rsvp';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll, fillIn, blur } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | course rollover', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    let course = EmberObject.create({
      id: 1,
      title: 'old course'
    });
    this.set('course', course);

    await render(hbs`{{course-rollover course=course}}`);

    const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    const yearSelect = '.year-select select';
    const title = '.title input';

    return settled().then(()=>{
      for (let i=0; i<6; i++){
        assert.equal(find(`${yearSelect} option:nth-of-type(${i+1})`).textContent.trim(), `${lastYear + i} - ${lastYear + 1 + i}`);
      }
      assert.equal(findAll(title).length, 1);
      assert.equal(find(title).value.trim(), course.get('title'));
    });

  });

  test('rollover course', async function(assert) {
    assert.expect(8);
    let course = EmberObject.create({
      id: 1,
      title: 'old title',
      startDate: moment().hour(0).minute(0).second(0).toDate()
    });

    let ajaxMock = Service.extend({
      request(url, {method, data}){
        let lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
        assert.equal(url.trim(), `/api/courses/${course.get('id')}/rollover`);
        assert.equal(method, 'POST');
        assert.ok('year' in data);
        assert.equal(data.year, lastYear);
        assert.equal(data.newCourseTitle, course.get('title'));
        assert.notOk('newStartDate' in data);
        assert.notOk('skipOfferings' in data);

        return resolve({
          courses: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    this.set('course', course);
    this.set('visit', (newCourse) => {
      assert.equal(newCourse.id, 14);
    });
    await render(hbs`{{course-rollover course=course visit=(action visit)}}`);
    await click('.done');
  });

  test('rollover course with new title', async function(assert) {
    assert.expect(3);
    let course = EmberObject.create({
      id: 1,
      title: 'old title',
      startDate: moment().hour(0).minute(0).second(0).toDate()
    });

    const newTitle = course.get('title') + '2';

    let ajaxMock = Service.extend({
      request(url, {method, data}){
        assert.equal(url.trim(), `/api/courses/${course.get('id')}/rollover`);
        assert.equal(method, 'POST');
        assert.equal(data.newCourseTitle, newTitle, 'The new title gets passed.');
        return resolve({
          courses: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);

    this.set('course', course);
    this.set('visit', () => {});

    await render(hbs`{{course-rollover course=course visit=(action visit)}}`);
    const title = '.title';
    const input = `${title} input`;
    await fillIn(input, newTitle);
    await settled();
    await click('.done');
    await settled();
  });


  test('disable years when title already exists', async function(assert) {
    assert.expect(5);
    const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    this.server.create('course', {
      id: 2,
      title: 'to be rolled',
      year: lastYear
    });
    this.server.create('course', {
      id: 3,
      title: 'to be rolled',
      year: lastYear+2
    });

    let course = EmberObject.create({
      id: 1,
      title: 'to be rolled',
    });
    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-rollover course=course visit=(action nothing)}}`);

    let options = findAll('select:nth-of-type(1) option');
    assert.ok(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.ok(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);
  });

  test('rollover course with new start date', async function(assert) {
    assert.expect(8);
    // ensure that rollover date and course start date fall on the same day of the week.
    let courseStartDate = moment().hour(0).minute(0).subtract(1, 'week').day(1);
    // Also, make sure that we're not crossing year boundaries here.
    // Otherwise, ilios will propel us into the current year which we do not want right here.
    if (courseStartDate.year() !== moment().year()) {
      courseStartDate = moment().hour(0).minute(0).add(1, 'week').day(1);
    }

    const rolloverDate = moment(courseStartDate).add(1, 'week');

    let course = EmberObject.create({
      id: 1,
      startDate: courseStartDate.toDate(),
      title: 'old course'
    });
    let ajaxMock = Service.extend({
      request(url, {data}){
        assert.ok('newStartDate' in data, 'A new start date was passed.');
        let newStartDate = moment(data.newStartDate);
        assert.equal(
          newStartDate.format('YYYY-MM-DD'),
          rolloverDate.format('YYYY-MM-DD'),
          'New start date is rollover date.'
        );
        return resolve({
          courses: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);

    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
    const advancedOptions = '.advanced-options';
    const title = `.advanced-options-title`;
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await click(title);
    let interactor = openDatepicker(find(startDate));
    assert.equal(
      interactor.selectedYear(),
      courseStartDate.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      courseStartDate.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      interactor.selectedDay(),
      courseStartDate.date(),
      'Selected day initialized to course start date day.'
    );
    interactor.selectDate(rolloverDate.toDate());
    assert.equal(
      interactor.selectedYear(),
      rolloverDate.year(),
      'Selected year changed to rollover date year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      rolloverDate.month(),
      'Selected month changed to rollover date month.'
    );
    assert.equal(
      interactor.selectedDay(),
      rolloverDate.date(),
      'Selected day changed to rollover date day.'
    );
    await click('.done');
  });

  test('rollover course prohibit non-matching day-of-week date selection', async function(assert) {
    assert.expect(5);
    // rollover date and course start date don't fall on the same day of the week.
    let courseStartDate = moment().hour(0).minute(0).subtract(1, 'week').day(1);
    // Make sure that we're not crossing year boundaries here.
    // Otherwise, ilios will propel us into the current year which we do not want right here.
    if (courseStartDate.year() !== moment().year()) {
      courseStartDate = moment().hour(0).minute(0).add(1, 'week').day(1);
    }
    const rolloverDate = moment(courseStartDate).add(1, 'week').day(3);

    let course = EmberObject.create({
      id: 1,
      title: 'test title',
      startDate: courseStartDate.toDate()
    });
    let ajaxMock = Service.extend({
      request(url, {data}){
        assert.ok('newStartDate' in data, 'A new start date was passed.');
        let newStartDate = moment(data.newStartDate);
        assert.equal(
          newStartDate.format('YYYY-MM-DD'),
          courseStartDate.format('YYYY-MM-DD'),
          'New start date is course start date.'
        );
        return resolve({
          courses: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);

    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
    const advancedOptions = '.advanced-options';
    const title = `.advanced-options-title`;
    const yearSelect = '.year-select select';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await click(title);
    await fillIn(yearSelect, courseStartDate.format('YYYY'));
    await blur(yearSelect);

    let interactor = openDatepicker(find(startDate));
    assert.equal(
      interactor.selectedYear(),
      courseStartDate.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      courseStartDate.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      interactor.selectedDay(),
      courseStartDate.date(),
      'Selected day initialized to course start date day.'
    );
    interactor.selectDate(rolloverDate.toDate());
    await click('.done');
  });

  /**
   * This tests wonky business logic where the targeted rollover start date gets adjusted to a date in the current year
   * if the given course has a start date in a former year.
   */
  test('rollover start date adjustment with former year course start date', async function(assert) {
    assert.expect(3);

    const courseStartDate = moment().hour(0).minute(0).subtract(2, 'year').day(1);
    const rolloverDate = moment()
      .hour(0)
      .minute(0)
      .isoWeek(courseStartDate.isoWeek())
      .isoWeekday(courseStartDate.isoWeekday());

    let course = EmberObject.create({
      id: 1,
      startDate: courseStartDate.toDate(),
      title: 'old course'
    });

    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
    const advancedOptions = '.advanced-options';
    const title = `.advanced-options-title`;
    const yearSelect = '.year-select select';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await click(title);
    await fillIn(yearSelect, rolloverDate.format('YYYY'));
    await blur(yearSelect);

    let interactor = openDatepicker(find(startDate));
    assert.equal(
      interactor.selectedYear(),
      rolloverDate.year(),
      'Selected year initialized to this year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      rolloverDate.month(),
      "Selected month initialized to this year's equivalent of course's start month."
    );
    assert.equal(
      interactor.selectedDay(),
      rolloverDate.date(),
      "Selected month initialized to this year's equivalent of course's start day."
    );
  });

  test('rollover course with no offerings', async function(assert) {
    assert.expect(4);
    this.server.create('course', {
      title: 'old course'
    });
    const course = run(() => this.owner.lookup('service:store').find('course', 1));
    let ajaxMock = Service.extend({
      request(url, {data}){
        assert.ok('skipOfferings' in data);
        assert.equal(data.skipOfferings, true);

        return resolve({
          courses: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);

    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
    const advancedOptions = '.advanced-options';
    const title = `.advanced-options-title`;
    const offerings = `${advancedOptions} [data-test-skip-offerings]`;

    await click(title);
    assert.ok(find(offerings).checked);
    await click(offerings);
    assert.notOk(find(offerings).checked);
    await click('.done');
  });

  test('errors do not show up initially', async function(assert) {
    let course = EmberObject.create({
      id: 1
    });
    this.set('course', course);

    await render(hbs`{{course-rollover course=course}}`);
    assert.equal(findAll('.validation-error-message').length, 0);
  });

  test('errors show up', async function(assert) {
    let course = EmberObject.create({
      id: 1
    });
    this.set('course', course);

    await render(hbs`{{course-rollover course=course}}`);

    const title = '.title';
    const input = `${title} input`;

    await fillIn(input, '');
    assert.equal(findAll('.validation-error-message').length, 1);
    assert.ok(find('.validation-error-message').textContent.includes('blank'));
  });

  test('rollover course with cohorts', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'SOM',
    });
    const program = this.server.create('program', {
      title: 'SOM',
      school
    });
    const programYear = this.server.create('programYear', {
      program,
      published: true,
      archived: false,
    });
    this.server.create('cohort', {
      programYear,
    });
    this.server.create('course', {
      title: 'old course',
      school,
    });
    const course = run(() => this.owner.lookup('service:store').find('course', 1));
    let ajaxMock = Service.extend({
      request(url, { data }) {
        assert.ok('newCohorts' in data);
        assert.deepEqual(data.newCohorts, ['1']);

        return resolve({
          courses: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    const mockCurrentUser = EmberObject.create({});

    const currentUserMock = Service.extend({
      model: resolve(mockCurrentUser)
    });
    this.owner.register('service:currentUser', currentUserMock);

    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
    const advancedOptions = '.advanced-options';
    const title = `.advanced-options-title`;
    const firstCohort = `${advancedOptions} .selectable-cohorts li:nth-of-type(1)`;

    await click(title);
    await click(firstCohort);
    await click('.done');
  });
});
