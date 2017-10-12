import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import wait from 'ember-test-helpers/wait';

const { Promise, resolve } = RSVP;

let storeMock;
moduleForComponent('course-rollover', 'Integration | Component | course rollover', {
  integration: true,
  beforeEach(){
    storeMock = Service.extend({});
    this.register('service:store', storeMock);
  }
});

test('it renders', function(assert) {
  storeMock.reopen({
    query(){
      return [];
    }
  });

  let course = EmberObject.create({
    id: 1,
    title: 'old course'
  });
  this.set('course', course);

  this.render(hbs`{{course-rollover course=course}}`);

  const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'));
  const yearSelect = '.year-select select';
  const title = '.title input';

  return wait().then(()=>{
    for (let i=0; i<6; i++){
      assert.equal(this.$(`${yearSelect} option:eq(${i})`).text().trim(), `${lastYear + i} - ${lastYear + 1 + i}`);
    }
    assert.equal(this.$(title).length, 1);
    assert.equal(this.$(title).val().trim(), course.get('title'));
  });

});

test('rollover course', function(assert) {
  assert.expect(14);
  let course = EmberObject.create({
    id: 1,
    title: 'old title',
    startDate: moment().hour(0).minute(0).second(0).toDate()
  });

  let ajaxMock = Service.extend({
    request(url, {method, data}){
      let lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'));
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
  this.register('service:commonAjax', ajaxMock);

  storeMock.reopen({
    pushPayload(obj){
      assert.ok('courses' in obj);
      assert.ok(obj.courses.length, 1);
      assert.equal(obj.courses[0].id, 14);
    },
    peekRecord(what, id){
      assert.equal(what, 'course');
      assert.equal(id, 14);

      return EmberObject.create({
        id: 14
      });
    },
    query(){
      return [];
    }
  });
  let flashmessagesMock = Service.extend({
    success(message){
      assert.equal(message, 'general.courseRolloverSuccess');
    }
  });
  this.register('service:flashMessages', flashmessagesMock);


  this.set('course', course);
  this.set('visit', (newCourse) => {
    assert.equal(newCourse.id, 14);
  });
  this.render(hbs`{{course-rollover course=course visit=(action visit)}}`);

  return wait().then(()=>{
    this.$('.done').click();
  });
});

test('rollover course with new title', function(assert) {
  assert.expect(5);
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
  this.register('service:commonAjax', ajaxMock);

  storeMock.reopen({
    pushPayload(){},
    peekRecord(what, id){
      assert.equal(what, 'course');
      assert.equal(id, 14);
      return EmberObject.create({
        id: 14
      });
    },
    query(){
      return [];
    }
  });
  let flashmessagesMock = Service.extend({
    success(){}
  });
  this.register('service:flashMessages', flashmessagesMock);

  this.set('course', course);
  this.set('visit', () => {});

  this.render(hbs`{{course-rollover course=course visit=(action visit)}}`);
  const title = '.title';
  const input = `${title} input`;
  this.$(input).val(newTitle);
  this.$(input).trigger('change');
  return wait().then(()=>{
    this.$('.done').click();
  });
});


test('disable years when title already exists', function(assert) {
  assert.expect(8);
  const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'));

  storeMock.reopen({
    query(what, {filters}){
      assert.equal(what, 'course');
      assert.ok('title' in filters);
      assert.equal(filters.title, 'to be rolled');

      return [
        {
          id: 2,
          year: lastYear
        },
        {
          id: 3,
          year: lastYear+2
        },
      ];
    }
  });

  let course = EmberObject.create({
    id: 1,
    title: 'to be rolled',
  });
  this.set('course', course);
  this.set('nothing', parseInt);
  this.render(hbs`{{course-rollover course=course visit=(action nothing)}}`);

  return wait().then(()=>{
    let options = this.$('select:eq(0) option');
    assert.ok(options.eq(0).prop('disabled'));
    assert.notOk(options.eq(1).prop('disabled'));
    assert.ok(options.eq(2).prop('disabled'));
    assert.notOk(options.eq(3).prop('disabled'));
    assert.notOk(options.eq(4).prop('disabled'));
  });
});

test('rollover course with new start date', function(assert) {
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
  this.register('service:commonAjax', ajaxMock);

  storeMock.reopen({
    pushPayload(){},
    peekRecord(){},
    query(){return [];}
  });
  getOwner(this).lookup('service:flash-messages').registerTypes(['success']);

  this.set('course', course);
  this.set('nothing', parseInt);
  this.render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
  const advancedOptions = '.advanced-options';
  const title = `.advanced-options-title`;
  const startDate = `${advancedOptions} input:eq(0)`;

  return wait().then(()=>{
    this.$(title).click();
    return wait().then(()=>{
      let interactor = openDatepicker(this.$(startDate));
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
      this.$('.done').click();
      return wait().then(() =>{
        // do nothing.
      });
    });
  });
});

test('rollover course prohibit non-matching day-of-week date selection', function(assert) {
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
  this.register('service:commonAjax', ajaxMock);

  storeMock.reopen({
    pushPayload(){},
    peekRecord(){},
    query(){return [];}
  });
  getOwner(this).lookup('service:flash-messages').registerTypes(['success']);

  this.set('course', course);
  this.set('nothing', parseInt);
  this.render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
  const advancedOptions = '.advanced-options';
  const title = `.advanced-options-title`;
  const yearSelect = '.year-select select';
  const startDate = `${advancedOptions} input:eq(0)`;

  return wait().then(() => {
    this.$(title).click();
    return wait().then(()=>{
      this.$(yearSelect).val(courseStartDate.format('YYYY')).change();
      return wait().then(()=>{
        let interactor = openDatepicker(this.$(startDate));
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
        this.$('.done').click();
        return wait().then(()=>{
          // sit back.
        });
      });
    });
  });
});

/**
 * This tests wonky business logic where the targeted rollover start date gets adjusted to a date in the current year
 * if the given course has a start date in a former year.
 */
test('rollover start date adjustment with former year course start date', function(assert) {
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

  storeMock.reopen({
    pushPayload(){},
    peekRecord(){},
    query(){return [];}
  });
  getOwner(this).lookup('service:flash-messages').registerTypes(['success']);

  this.set('course', course);
  this.set('nothing', parseInt);
  this.render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
  const advancedOptions = '.advanced-options';
  const title = `.advanced-options-title`;
  const yearSelect = '.year-select select';
  const startDate = `${advancedOptions} input:eq(0)`;

  return new Promise(resolve => {
    run(()=>{
      this.$(title).click();
      wait().then(()=>{
        this.$(yearSelect).val(rolloverDate.format('YYYY')).change();
        wait().then(()=>{
          let interactor = openDatepicker(this.$(startDate));
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

          wait().then(()=>{
            resolve();
          });
        });
      });
    });
  });
});

test('rollover course with no offerings', function(assert) {
  assert.expect(3);
  let course = EmberObject.create({
    id: 1,
    title: 'old course'
  });
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
  this.register('service:commonAjax', ajaxMock);

  storeMock.reopen({
    pushPayload(){},
    peekRecord(){},
    query(){return [];}
  });
  getOwner(this).lookup('service:flash-messages').registerTypes(['success']);

  this.set('course', course);
  this.set('nothing', parseInt);
  this.render(hbs`{{course-rollover course=course visit=(action nothing)}}`);
  const advancedOptions = '.advanced-options';
  const title = `.advanced-options-title`;
  const offerings = `${advancedOptions} input:eq(1)`;

  return new Promise(resolve => {
    run(()=>{
      this.$(title).click();
      wait().then(()=>{
        assert.ok(this.$(offerings).is(':checked'));
        this.$(offerings).click();
        this.$(offerings).trigger('update');

        this.$('.done').click();
        wait().then(()=>{
          resolve();
        });
      });
    });
  });
});

test('errors do not show up initially', function(assert) {
  storeMock.reopen({
    query(){
      return [];
    }
  });
  let course = EmberObject.create({
    id: 1
  });
  this.set('course', course);

  this.render(hbs`{{course-rollover course=course}}`);

  return wait().then(() => {
    assert.equal(this.$('.messagee').length, 0);
  });
});

test('errors show up', function(assert) {
  storeMock.reopen({
    query(){
      return [];
    }
  });
  let course = EmberObject.create({
    id: 1
  });
  this.set('course', course);

  this.render(hbs`{{course-rollover course=course}}`);

  const title = '.title';
  const input = `${title} input`;
  this.$(input).val('');
  this.$(input).trigger('change');
  assert.ok(this.$(title).text().search(/blank/) > -1);

  return wait();
});

test('changing the title looks for new matching courses', function(assert) {
  assert.expect(6);
  let count = 0;
  storeMock.reopen({
    query(what, {filters}){
      assert.equal(what, 'course');
      assert.ok('title' in filters);
      if (count === 0){
        assert.equal(filters.title, 'to be rolled');
      } else {
        assert.equal(filters.title, 'to be rolled again');
      }
      count++;

      return [];
    }
  });

  let course = EmberObject.create({
    id: 1,
    title: 'to be rolled',
  });
  this.set('course', course);
  this.render(hbs`{{course-rollover course=course}}`);
  const title = '.title input';

  run.later(()=>{
    this.$(title).val('to be rolled again');
    this.$(title).trigger('change');
  }, 500);

  return wait();


});
