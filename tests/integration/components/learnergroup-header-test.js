import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('learnergroup-header', 'Integration | Component | learnergroup header', {
  integration: true
});

test('it renders', function(assert) {
  let learnerGroup = Object.create({
    title: 'our group',
    allParents: resolve([{title: 'parent group'}])
  });

  this.set('learnerGroup', learnerGroup);
  this.render(hbs`{{learnergroup-header learnerGroup=learnerGroup}}`);

  assert.equal(this.$('h2').text().trim(), 'our group');
  assert.equal(this.$('.breadcrumbs').text().replace(/\s/g,''), 'LearnerGroupsparentgroupourgroup');
});

test('can change title', function(assert) {
  let learnerGroup = Object.create({
    title: 'our group',
    save(){
      assert.equal(this.get('title'), 'new title');
    }
  });

  this.set('learnerGroup', learnerGroup);
  this.render(hbs`{{learnergroup-header learnerGroup=learnerGroup}}`);

  assert.equal(this.$('h2').text().trim(), 'our group');
  this.$('h2 .editable').click();
  this.$('h2 input').val('new title');
  this.$('h2 input').trigger('change');
  this.$('h2 .done').click();
});

test('counts members correctly', function(assert) {
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
    usersOnlyAtThisLevel: [1],
    cohort,
    children: resolve([subGroup])
  });

  this.set('learnerGroup', learnerGroup);
  this.render(hbs`{{learnergroup-header learnerGroup=learnerGroup}}`);

  assert.equal(this.$('header .info').text().trim(), 'Members:  1 / 2');
});
