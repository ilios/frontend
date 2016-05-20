import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object, Service } = Ember;
const { resolve } = RSVP;

moduleForComponent('learnergroup-subgroup-list', 'Integration | Component | learnergroup subgroup list', {
  integration: true
});

test('it renders', function(assert) {
  let subGroup1 = {
    title: 'first',
    users: [1,2],
    children: [],
  };
  let subGroup2 = {
    title: 'second',
    users: [],
    children: [1,2],
  };
  let parentGroup = {
    children: resolve([subGroup1, subGroup2])
  };

  this.set('parentGroup', parentGroup);

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

  assert.equal(this.$('th:eq(0)').text().trim(), 'Learner Group Title');
  assert.equal(this.$('th:eq(1)').text().trim(), 'Members');
  assert.equal(this.$('th:eq(2)').text().trim(), 'Subgroups');
  assert.equal(this.$('th:eq(3)').text().trim(), 'Actions');

  assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'first');
  assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), 2);
  assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), 0);
  assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), 'second');
  assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), 0);
  assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), 2);

});

test('can remove group', function(assert) {
  let subGroup1 = {
    title: 'first',
    users: [1,2],
    children: [],
    destroyRecord(){
      assert.ok(true);
    }
  };
  let parentGroup = {
    children: resolve([subGroup1])
  };

  this.set('parentGroup', parentGroup);

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

  this.$('tbody td:eq(3) .remove').click();
  this.$('tbody tr:eq(1) .remove').click();
});

test('removal confirmation', function(assert) {
  let subGroup1 = {
    title: 'first',
    users: [1,2],
    children: [],
  };
  let parentGroup = {
    children: resolve([subGroup1])
  };

  this.set('parentGroup', parentGroup);

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

  this.$('tbody td:eq(3) .remove').click();

  assert.ok(this.$('tbody tr:eq(0)').hasClass('confirm-removal'));
  assert.equal(this.$('tbody tr:eq(1)').text().trim().search(/Are you sure/), 0);

});

test('add new group', function(assert) {
  let cohort = {a: 1};
  let subGroup1 = {
    title: 'first',
    users: [1,2],
    children: []
  };
  let parentGroup = {
    children: resolve([subGroup1]),
    cohort: resolve(cohort)
  };

  let storeMock = Service.extend({
    createRecord(what, {title, cohort, parent}){
      assert.equal('learner-group', what);
      assert.equal('new group', title);
      assert.equal(cohort, cohort);

      let newGroup = {
        title,
        cohort,
        parent
      };

      return Object.create({
        save(){
          return resolve(newGroup);
        }
      });
    }
  });
  this.register('service:store', storeMock);

  this.set('parentGroup', Object.create(parentGroup));

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
  assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'first');

  this.$('.expand-button').click();

  return wait().then(()=>{
    this.$('input').val('new group');
    this.$('input').trigger('change');
    this.$('.done').click();
  });

});
