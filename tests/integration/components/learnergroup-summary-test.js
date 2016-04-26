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
  let subGroup = Object.create({
    title: 'test sub-group',
    users: [],
    children: [],
  });
  let learnerGroup = Object.create({
    title: 'test group',
    location: 'test location',
    children: resolve([subGroup]),
    allInstructors: resolve([
      {fullName: 'Test Person'},
      {fullName: 'Test Person2'},
    ]),
    courses: resolve([
      {title: 'test course 1'},
      {title: 'test course 2'},
    ]),
  });
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-summary learnerGroup=learnerGroup}}`);

  return wait().then(()=>{
    assert.equal(this.$('.overview label:eq(0)').text().trim(), 'Default Location:');
    assert.equal(this.$('.overview label:eq(1)').text().trim(), 'Default Instructors:');
    assert.equal(this.$('.overview label:eq(2)').text().trim(), 'Associated Courses:');
    assert.equal(this.$('.overview .form-data:eq(0)').text().trim(), 'test location');
    assert.equal(this.$('.overview .form-data:eq(1)').text().trim(), 'Test Person; Test Person2');
    assert.equal(this.$('.overview .form-data:eq(2)').text().trim(), 'test course 1; test course 2');
    assert.equal(this.$('.learnergroup-user-list:eq(0)').text().trim(), 'LIST OF USERS');
    assert.equal(this.$('.learnergroup-subgroup-list .detail-title').text().trim(), 'Subgroups (1)');
    assert.equal(this.$('.learnergroup-subgroup-list tbody tr:eq(0) td:eq(0)').text().trim(), 'test sub-group');
    assert.equal(this.$('.learnergroup-subgroup-list tbody tr:eq(0) td:eq(1)').text().trim(), '0');
    assert.equal(this.$('.learnergroup-subgroup-list tbody tr:eq(0) td:eq(2)').text().trim(), '0');
  });
});
