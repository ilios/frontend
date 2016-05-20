import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('learnergroup-summary', 'Integration | Component | learnergroup summary', {
  integration: true
});

test('renders with data', function(assert) {
  const user1 = Object.create({
    fullName: 'user1'
  });
  const user2 = Object.create({
    fullName: 'user2'
  });
  const user3 = Object.create({
    fullName: 'user3'
  });
  const user4 = Object.create({
    fullName: 'user4'
  });
  const user5 = Object.create({
    fullName: 'user5'
  });
  const user6 = Object.create({
    fullName: 'user6'
  });

  const cohort = Object.create({
    title: 'this cohort',
    users: resolve([user1, user2, user3, user4]),
  });
  let subGroup = Object.create({
    title: 'test sub-group',
    users: resolve([]),
    children: resolve([]),
  });
  let learnerGroup = Object.create({
    title: 'test group',
    location: 'test location',
    children: resolve([subGroup]),
    allInstructors: resolve([user5, user6]),
    users: resolve([user1, user2]),
    allDescendantUsers: resolve([user1, user2]),
    courses: resolve([
      {title: 'test course 1'},
      {title: 'test course 2'},
    ]),
    cohort: resolve(cohort),
  });
  learnerGroup.set('topLevelGroup', resolve(learnerGroup));

  this.set('nothing', parseInt);
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-summary
    toggleEditMode=(action nothing)
    setSortUsersBy=(action nothing)
    learnerGroup=learnerGroup
    isEditing=false
  }}`);

  const location = '.overview .form-data:eq(0)';
  const instructors = '.overview .form-data:eq(1)';
  const courses = '.overview .form-data:eq(2)';

  return wait().then(()=>{
    assert.equal(this.$(location).text().trim(), 'test location');
    assert.equal(this.$(instructors).text().trim(), 'user5; user6');
    assert.equal(this.$(courses).text().trim(), 'test course 1; test course 2');
  });
});

test('Update location', function(assert) {
  assert.expect(3);

  const cohort = Object.create({
    title: 'this cohort',
    users: resolve([]),
  });
  let subGroup = Object.create({
    title: 'test sub-group',
    users: resolve([]),
    children: resolve([]),
  });
  let learnerGroup = Object.create({
    title: 'test group',
    location: 'test location',
    children: resolve([subGroup]),
    allInstructors: resolve([]),
    users: resolve([]),
    allDescendantUsers: resolve([]),
    courses: resolve([
      {title: 'test course 1'},
      {title: 'test course 2'},
    ]),
    cohort: resolve(cohort),
    save(){
      assert.equal(this.get('location'), 'new location name');
      return resolve(this);
    },
  });
  learnerGroup.set('topLevelGroup', resolve(learnerGroup));

  this.set('nothing', parseInt);
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-summary
    toggleEditMode=(action nothing)
    setSortUsersBy=(action nothing)
    learnerGroup=learnerGroup
    isEditing=false
  }}`);

  const location = '.overview .form-data:eq(0)';
  const editLocation = location + ' .editable';
  const input = location + ' input';
  const save = location + ' .done';
  return wait().then(()=>{
    assert.equal(this.$(location).text().trim(), 'test location');
    this.$(editLocation).click();
    this.$(input).val('new location name');
    this.$(input).trigger('change');
    this.$(save).click();
    return wait().then(()=>{
      assert.equal(this.$(location).text().trim(), 'new location name');
    });
  });
});
