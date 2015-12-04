/* global moment */
import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

const { isEmpty, RSVP, run } = Ember;
const { Promise } = RSVP;
const { next } = run;

moduleForComponent('offering-editor', 'Unit | Component | offering editor ' + testgroup, {
  unit: true
});

test('properties have default values', function(assert) {
  assert.expect(1);

  const expected = {
    smallGroupMode:   true,
    isMultiDay:       false,
    room:             null,
    instructors:      [],
    instructorGroups: [],
    learnerGroups:    {}
  };

  const component = this.subject();

  const actual = {
    smallGroupMode:   component.get('smallGroupMode'),
    isMultiDay:       component.get('isMultiDay'),
    room:             component.get('room'),
    instructors:      component.get('instructors'),
    instructorGroups: component.get('instructorGroups'),
    learnerGroups:    component.get('learnerGroups')
  };

  assert.deepEqual(actual, expected, 'default values are correct');
});

test('`setOfferingType` action changes `smallGroupMode` property', function(assert) {
  assert.expect(1);

  const component = this.subject();

  component.send('setOfferingType', false);

  assert.equal(component.get('smallGroupMode'), false);
});

test('`toggleMultiDay` action changes `isMultiDay` property', function(assert) {
  assert.expect(1);

  const component = this.subject();

  component.send('toggleMultiDay');

  assert.equal(component.get('isMultiDay'), true);
});

test('`changeStartTime` & `changeEndTime` actions change `startDate` & `endDate`', function(assert) {
  assert.expect(2);

  const date = moment().toDate();

  const component = this.subject();

  component.send('changeStartTime', date);
  assert.ok(component.get('startDate') instanceof Date);

  component.send('changeEndTime', date);
  assert.ok(component.get('endDate') instanceof Date);
});

test('actions adding/removing instructors/instructorGroups/learnerGroups work properly', function(assert) {
  assert.expect(9);

  const argument = Ember.Object.create({
    name: 'John Doe',
    allDescendants: new Promise((resolve) => {
      resolve([]);
    })
  });

  const cohorts = [{ id: 12 }];
  const component = this.subject({ cohorts });

  component.send('addInstructor', argument);
  assert.equal(component.get('instructors').length, 1);
  assert.equal(component.get('instructors')[0].name, 'John Doe');

  component.send('removeInstructor', argument);
  assert.ok(isEmpty(component.get('instructors')));

  component.send('addInstructorGroup', argument);
  assert.equal(component.get('instructorGroups').length, 1);
  assert.equal(component.get('instructorGroups')[0].name, 'John Doe');

  component.send('removeInstructorGroup', argument);
  assert.ok(isEmpty(component.get('instructorGroups')));

  component.send('addLearnerGroup', argument, 12);

  next(component, () => {
    const cohortGroups = component.get('learnerGroups')[12];

    assert.equal(cohortGroups.length, 1);
    assert.equal(cohortGroups[0].get('name'), 'John Doe');

    component.send('removeLearnerGroup', argument, 12);
    assert.ok(isEmpty(cohortGroups));
  });
});
