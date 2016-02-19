import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import Ember from 'ember';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile', 'Integration | Component | user profile', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
});

test('it renders', function(assert) {
  let user = Object.create({
    fullName: 'Test Person Name Thing',
    roles: resolve([]),
    cohorts: resolve([]),
    primaryCohort: resolve(null)
  });

  this.set('user', user);

  this.render(hbs`{{user-profile user=user}}`);

  assert.equal(this.$().text().trim().search(/Test Person Name Thing/), 0);
});

test('does not break when a user has secondry, but no primary cohorts', function(assert) {
  let cohort = Object.create({
    title: "awesome cohort"
  });
  let user = Object.create({
    fullName: 'Test Person Name Thing',
    roles: resolve([]),
    cohorts: resolve([cohort]),
    primaryCohort: resolve(null)
  });

  this.set('user', user);

  this.render(hbs`{{user-profile user=user}}`);

  assert.equal(this.$().text().trim().search(/Test Person Name Thing/), 0);
  assert.notEqual(this.$().text().trim().search(/awesome cohort/), -1);
});
