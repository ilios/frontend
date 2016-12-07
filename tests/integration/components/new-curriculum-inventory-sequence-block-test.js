import Ember from 'ember';
import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { RSVP, Object, Service } = Ember;
const { resolve } = RSVP;

moduleForComponent('new-curriculum-inventory-sequence-block', 'Integration | Component | new curriculum inventory sequence block', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(75);
  let school = Object.create({ id() { return 1; }});
  let academicLevels = [];
  for (let i = 0; i < 10; i++) {
    academicLevels.pushObject(Object.create({ id: i, name: `Year ${i}` }));
  }
  let course1 = Object.create({ title: 'Belial', id: 1 });
  let course2 = Object.create({ title: 'Behemoth', id: 2 });
  let course3 = Object.create({ title: 'Beelzebub', id: 3 });

  let program = Object.create({
    belongsTo() {
      return school;
    }
  });
  let report = Object.create({
    academicLevels,
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([ course2 ])
  });

  let storeMock = Service.extend({
    query(what, {limit, filters}){
      assert.equal(what, 'course', 'Store is queried for courses.');
      assert.equal(filters.school.length, 1, 'One school id was passed.');
      assert.equal(filters.school[0], school.id(), 'The correct school id was passed.');
      assert.equal(filters.year, report.get('year'), 'The correct year was passed.');
      assert.equal(filters.published, true, 'The correct published value was passed.');
      assert.equal(limit, 10000, 'The correct record limit was passed.');
      return resolve([course1, course2, course3 ]);
    },
  });
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
  return wait().then(() => {
    assert.equal(this.$('.new-result-title').text().trim(), 'New Sequence Block', 'Component title shows.');
    assert.equal(this.$('.title label').text().trim(), 'Title:', 'Title label is correct.');
    assert.equal(this.$('.title input').val(), '', 'Title input is initially empty.');
    assert.equal(this.$('.description label').text().trim(), 'Description:', 'Description label is correct.');
    assert.equal(this.$('.description textarea').val(), '', 'Description input is initially empty.');
    assert.equal(this.$('.course label').text().trim(), 'Course:', 'Course label is correct.');
    assert.equal(this.$('.course option').length, 3, 'Course dropdown has correct number of options');
    assert.equal(this.$('.course option:eq(0)').val(), '', 'First course option has no value.');
    assert.equal(this.$('.course option:eq(0)').text().trim(), 'Select a Course', 'First course option is labeled correctly');
    assert.equal(this.$(`.course option:eq(1)`).val(), course3.get('id'), 'Second course option has correct value');
    assert.equal(this.$(`.course option:eq(1)`).text().trim(), course3.get('title'), 'Second course option is labeled correctly');
    assert.equal(this.$(`.course option:eq(2)`).val(), course1.get('id'), 'Third course option has correct value');
    assert.equal(this.$(`.course option:eq(2)`).text().trim(), course1.get('title'), 'Third course option is labeled correctly');
    assert.equal(this.$(`.required label`).text().trim(), 'Required:', 'Required label is correct');
    assert.equal(this.$(`.required option`).length, 3, 'There are three required options');
    assert.equal(this.$(`.required option:eq(0)`).val(), '1', 'Required option value is correct.');
    assert.equal(this.$(`.required option:eq(0)`).text().trim(), 'Required', 'Required option label is correct.');
    assert.equal(this.$(`.required option:eq(1)`).val(), '2', 'Required option value is correct.');
    assert.equal(this.$(`.required option:eq(1)`).text().trim(), 'Optional (elective)', 'Required option label is correct.');
    assert.equal(this.$(`.required option:eq(2)`).val(), '3', 'Required option value is correct.');
    assert.equal(this.$(`.required option:eq(2)`).text().trim(), 'Required In Track', 'Required option label is correct.');
    assert.equal(this.$(`.track label`).text().trim(), 'Is Track?', 'Track label is correct');
    assert.equal(this.$(`.track .editinplace`).length, 1, 'Track switcher is visible.');
    assert.equal(this.$(`.start-date label`).text().trim(), 'Start Date:', 'Start date label is correct.');
    assert.equal(this.$(`.start-date input`).val(), '', 'Start date input is initially empty.');
    assert.equal(this.$(`.end-date label`).text().trim(), 'End Date:', 'End date label is correct.');
    assert.equal(this.$(`.end-date input`).val(), '', 'End date input is initially empty.');
    assert.equal(this.$(`.duration label`).text().trim(), 'Duration (in Days):', 'Duration label is correct.');
    assert.equal(this.$(`.duration input`).val(), '0', 'Duration input has initial value of zero.');
    assert.equal(this.$(`.clear-dates button`).text().trim(), 'Clear Dates', 'Clear dates button is labeled correctly.');
    assert.equal(this.$(`.minimum label`).text().trim(), 'Minimum:', 'Minimum label is correct.');
    assert.equal(this.$(`.minimum input`).val(), '0', 'Minimum input is initially empty.');
    assert.equal(this.$(`.maximum label`).text().trim(), 'Maximum:', 'Minimum label is correct.');
    assert.equal(this.$(`.maximum input`).val(), '0', 'Maximum input is initially empty.');
    assert.equal(this.$(`.academic-level label`).text().trim(), 'Academic Level:', 'Academic level label is correct.');
    assert.equal(this.$(`.academic-level option`).length, academicLevels.length, 'Academic level dropdown has the correct number of options.');
    for (let i = 0; i < academicLevels.length; i++) {
      let level = academicLevels[i];
      assert.equal(this.$(`.academic-level option:eq(${i})`).text().trim(), level.get('name'), 'Academic level option label is correct.');
      assert.equal(this.$(`.academic-level option:eq(${i})`).val(), level.get('id'), 'Academic level option value is correct.');
    }
    assert.equal(this.$(`.child-sequence-order label`).text().trim(), 'Child Sequence Order:', 'Child sequence order label is correct');
    assert.equal(this.$(`.child-sequence-order option`).length, 3, 'There are three child sequence order options');
    assert.equal(this.$(`.child-sequence-order option:eq(0)`).val(), '1', 'Child sequence order option value is correct.');
    assert.equal(this.$(`.child-sequence-order option:eq(0)`).text().trim(), 'Ordered', 'Child sequence order option label is correct.');
    assert.equal(this.$(`.child-sequence-order option:eq(1)`).val(), '2', 'Child sequence order option value is correct.');
    assert.equal(this.$(`.child-sequence-order option:eq(1)`).text().trim(), 'Unordered', 'Child sequence order option label is correct.');
    assert.equal(this.$(`.child-sequence-order option:eq(2)`).val(), '3', 'Child sequence order option value is correct.');
    assert.equal(this.$(`.child-sequence-order option:eq(2)`).text().trim(), 'Parallel', 'Child sequence order option label is correct.');
    assert.equal(this.$(`.order-in-sequence`).length, 0, 'Order-in-sequence input is not visible for top-level block creation');
    assert.equal(this.$('button.done').length, 1, 'Done button is present.');
    assert.equal(this.$('button.done').text().trim(), 'Done', 'Done button is labeled correctly.');
    assert.equal(this.$('button.cancel').length, 1, 'Cancel button is present.');
    assert.equal(this.$('button.cancel').text().trim(), 'Cancel', 'Cancel button is labeled correctly.');
  });
});

test('order-in-sequence options are visible for ordered parent sequence block', function(assert) {
  assert.expect(24);
  let school = Object.create({ id() { return 1; }});
  let program = Object.create({
    belongsTo() {
      return school;
    }
  });
  let report = Object.create({
    academicLevels: [],
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([])
  });

  let siblings = [];
  for (let i = 0; i < 10; i++) {
    siblings.pushObject(Object.create());
  }

  let parentBlock = Object.create({
    isOrdered: true,
    children: resolve(siblings)
  });

  let storeMock = Service.extend({
    query(){
      return resolve([]);
    },
  });
  this.register('service:store', storeMock);
  this.set('report', report);
  this.set('parentBlock', parentBlock);
  this.render(hbs`{{new-curriculum-inventory-sequence-block report=report parent=parentBlock}}`);
  return wait().then(() => {
    let numOptions = siblings.length + 1;
    assert.equal(this.$(`.order-in-sequence label`).text().trim(), 'Order in Sequence:', 'Order in sequence label is correct');
    assert.equal(this.$(`.order-in-sequence option`).length,  numOptions, 'Correct number of order in sequence options');
    for (let i = 0; i < numOptions; i++) {
      let orderInSequence = i + 1;
      assert.equal(this.$(`.order-in-sequence option:eq(${i})`).val(), orderInSequence, 'Order in sequence option value is correct');
      assert.equal(this.$(`.order-in-sequence option:eq(${i})`).text().trim(), orderInSequence, 'Order in sequence option label is correct');
    }
  });
});

/* for whatever reason, changing the course option does not trigger the course property to be mutated on this component.
 * commented this test in until a solution has been found.
 * @todo try this again in acceptance test [ST 2016/11/04]
 */
skip('selecting course reveals additional course info', function(assert) {
  assert.expect(6);
  let school = Object.create({ id() { return 1; }});
  let clerkshipType = Object.create({
    title: 'selective'
  });
  let course = Object.create({
    id: 1,
    title: 'my fancy course',
    startDate: moment('2016-05-01').toDate(),
    endDate: moment('2017-03-22').toDate(),
    level: 4,
    clerkshipType
  });

  let program = Object.create({
    belongsTo() {
      return school;
    }
  });
  let report = Object.create({
    academicLevels: [],
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([])
  });
  let storeMock = Service.extend({
    query(){
      return resolve([ course ]);
    },
  });
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
  return wait().then(() => {
    let details = this.$('.course .details');
    let courseOption = this.$('.course option:eq(1)');
    assert.equal(details.length, 0, 'Course details are initially not visible.');
    this.$('.course select').val(1).trigger('change');
    courseOption.prop('selected', true);
    courseOption.trigger('change');
    return wait().then(() => {
      assert.equal(details.length, 1, 'Course details are visible when course is selected.');
      assert.ok(details.text().indexOf('Level: ' + course.get('level')) === 0);
      assert.ok(details.text().indexOf('Start Date: ' + moment(course.get('startDate')).format('YYYY-MM-DD')) > 0);
      assert.ok(details.text().indexOf('End Date: ' + moment(course.get('endDate')).format('YYYY-MM-DD')) > 0);
      assert.ok(details.text().indexOf('Clerkship (' + course.get('clerkshipType').get('title') + ')') > 0);
    });
  });
});

skip('save', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save nested block passes parent block id', function(assert) {
  assert.ok(false, 'to be implemented');
});

test('cancel', function(assert) {
  assert.expect(1);
  let school = Object.create({ id() { return 1; }});
  let program = Object.create({
    belongsTo() {
      return school;
    }
  });

  let report = Object.create({
    academicLevels: [],
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([])
  });

  let storeMock = Service.extend({
    query(){
      return resolve([]);
    },
  });

  let cancelAction = function(){
    assert.ok(true, 'Cancel action was invoked.');
  };

  this.register('service:store', storeMock);
  this.set('report', report);
  this.set('cancelAction', cancelAction);
  this.render(hbs`{{new-curriculum-inventory-sequence-block report=report cancel=(action cancelAction)}}`);
  return wait().then(() => {
    this.$('.buttons .cancel').click();
  });
});

test('clear dates', function(assert) {
  assert.expect(4);
  const newStartDate = moment('2016-01-12');
  const newEndDate = moment('2017-02-22');
  let school = Object.create({ id() { return 1; }});
  let program = Object.create({
    belongsTo() {
      return school;
    }
  });

  let report = Object.create({
    academicLevels: [],
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([])
  });

  let storeMock = Service.extend({
    query(){
      return resolve([]);
    },
  });
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
  return wait().then(() => {
    let startDateInput = this.$('.start-date input');
    let endDateInput = this.$('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(newStartDate.toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(newEndDate.toDate());
    assert.equal(newStartDate.format('M/D/YYYY'), startDateInput.val(), 'Start date is set');
    assert.equal(newEndDate.format('M/D/YYYY'), endDateInput.val(), 'End date is set');
    this.$('.clear-dates button').click();
    return wait().then(() => {
      assert.equal(startDateInput.val(), '', 'Start date input has been cleared.');
      assert.equal(endDateInput.val(), '', 'End date input has been cleared.');
    });
  });
});

skip('save fails when minimum is larger than maximum', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails when minimum is less than zero', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails when minimum is empty', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails when maximum is empty', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save with date range and a zero duration', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save with non-zero duration and no date range', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails if end-date is older than start-date', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails on missing duration', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails on invalid duration', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails if neither date range nor duration is provided', function(assert) {
  assert.ok(false, 'to be implemented');
});

skip('save fails if start-date is given but no end-date is provided', function(assert) {
  assert.ok(false, 'to be implemented');
});
