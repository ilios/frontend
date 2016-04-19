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
  let cohort = Object.create({
    title: 'test group',
    users: [1, 2]
  });
  let subGroup = Object.create({
    title: 'test sub-group',
    users: [],
    children: [],
  });
  let learnerGroup = Object.create({
    title: 'test group',
    users: [1],
    cohort,
    children: resolve([subGroup])
  });
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-summary learnerGroup=learnerGroup}}`);

  return wait().then(()=>{
    assert.equal(this.$('.detail-header .title').text().trim(), 'test group');
    assert.equal(this.$('.detail-header .info').text().trim(), 'Members:  1 / 2');
    assert.equal(this.$('.breadcrumbs span:eq(0)').text().trim(), 'Learner Groups');
    assert.equal(this.$('.breadcrumbs span:eq(1)').text().trim(), 'test group');
    assert.equal(this.$('.learnergroup-user-list:eq(0)').text().trim(), 'LIST OF USERS');
    assert.equal(this.$('.learnergroup-subgroup-list .detail-title').text().trim(), 'Subgroups (1)');
    assert.equal(this.$('.learnergroup-subgroup-list tbody tr:eq(0) td:eq(0)').text().trim(), 'test sub-group');
    assert.equal(this.$('.learnergroup-subgroup-list tbody tr:eq(0) td:eq(1)').text().trim(), '0');
    assert.equal(this.$('.learnergroup-subgroup-list tbody tr:eq(0) td:eq(2)').text().trim(), '0');
  });
});
