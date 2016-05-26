import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('my-profile', 'Integration | Component | my profile', {
  integration: true
});

test('it renders all yes', function(assert) {
  const cohort = Object.create({
    title: 'test cohort',
    programYear: Object.create({
      program: Object.create({
        title: 'test program'
      })
    })
  });
  const user = Object.create({
    fullName: 'test name',
    isStudent: true,
    roles: resolve([
      Object.create({title: 'Course Director'}),
      Object.create({title: 'Faculty'}),
      Object.create({title: 'Developer'}),
      Object.create({title: 'Former Student'}),
    ]),
    userSyncIgnore: true,
    school: resolve(Object.create({title: 'test school'})),
    primaryCohort: resolve(Object.create({title: 'test cohort'})),
    secondaryCohorts: resolve([
      Object.create({title: 'second cohort'}),
      Object.create({title: 'a third cohort'}),
    ]),
    learnerGroups: resolve([
      Object.create({title: 'first group', cohort}),
      Object.create({title: 'a second group', cohort}),
    ]),
  });

  this.set('user', user);

  this.render(hbs`{{my-profile user=user}}`);

  assert.equal(this.$('.name').text().trim(), 'test name');
  assert.equal(this.$('.is-student').text().trim(), 'Student');
  assert.ok(this.$('.permissions-row:eq(0) i').hasClass('fa-check'));
  assert.ok(this.$('.permissions-row:eq(1) i').hasClass('fa-check'));
  assert.ok(this.$('.permissions-row:eq(2) i').hasClass('fa-check'));
  assert.ok(this.$('.permissions-row:eq(3) i').hasClass('fa-check'));

  assert.equal(this.$('.info .row:eq(0) .content').text().trim(), 'test school');
  assert.equal(this.$('.info .row:eq(1) .content').text().trim(), 'test cohort');
  assert.equal(this.$('.info .row:eq(2) .content li:eq(0)').text().trim(), 'a third cohort');
  assert.equal(this.$('.info .row:eq(2) .content li:eq(1)').text().trim(), 'second cohort');
  assert.equal(this.$('.info .row:eq(3) .content li:eq(0)').text().trim(), 'a second group (test cohort test program)');
  assert.equal(this.$('.info .row:eq(3) .content li:eq(1)').text().trim(), 'first group (test cohort test program)');

});

test('it renders all no', function(assert) {
  const user = Object.create({
    fullName: 'test name',
    isStudent: false,
    roles: resolve([]),
    userSyncIgnore: false,
    school: resolve(),
    primaryCohort: resolve(),
    secondaryCohorts: resolve([]),
    learnerGroups: resolve([]),
  });

  this.set('user', user);

  this.render(hbs`{{my-profile user=user}}`);

  assert.equal(this.$('.name').text().trim(), 'test name');
  assert.equal(this.$('.is-student').text().trim(), '');
  assert.ok(this.$('.permissions-row:eq(0) i').hasClass('fa-ban'));
  assert.ok(this.$('.permissions-row:eq(1) i').hasClass('fa-ban'));
  assert.ok(this.$('.permissions-row:eq(2) i').hasClass('fa-ban'));
  assert.ok(this.$('.permissions-row:eq(3) i').hasClass('fa-ban'));

  assert.equal(this.$('.info .row:eq(0) .content').text().trim(), 'Unassigned');
  assert.equal(this.$('.info .row:eq(1) .content').text().trim(), 'Unassigned');
  assert.equal(this.$('.info .row:eq(2) .content li').length, 0);
  assert.equal(this.$('.info .row:eq(3) .content li').length, 0);

});
