import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

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

test('can change title', async function(assert) {
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
  await wait();
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

test('validate title length', async function(assert) {
  assert.expect(4);
  const title = 'h2';
  const edit = `${title} .editable`;
  const input = `${title} input`;
  const done = `${title} .done`;
  const errors = `${title} .validation-error-message`;

  let learnerGroup = Object.create({
    title: 'our group',
    save(){
      assert.ok(false, 'should not be called');
    }
  });

  this.set('learnerGroup', learnerGroup);
  this.render(hbs`{{learnergroup-header learnerGroup=learnerGroup}}`);

  assert.equal(this.$(title).text().trim(), 'our group', 'title is correct');
  assert.equal(this.$(errors).length, 0, 'there are no errors');
  this.$(edit).click();
  const longTitle = 'x'.repeat(61);
  this.$(input).val(longTitle).change();
  this.$(done).click();
  await wait();
  assert.equal(this.$(errors).length, 1, 'there is now an error');
  assert.ok(this.$(errors).text().search(/too long/) > -1, 'it is the correct error');
});
