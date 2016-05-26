import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile', 'Integration | Component | user profile', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
});

let currentUserMock = Ember.Service.extend({
  userIsDeveloper: resolve(true),
  cohortsInAllAssociatedSchools: resolve([])
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

test('does not break when a user has secondary, but no primary cohorts', function(assert) {
  let cohort = Object.create({
    title: "awesome cohort"
  });
  let user = Object.create({
    fullName: 'Test Person Name Thing',
    roles: resolve([]),
    secondaryCohorts: resolve([cohort]),
  });

  this.set('user', user);

  this.render(hbs`{{user-profile user=user}}`);

  assert.equal(this.$().text().trim().search(/Test Person Name Thing/), 0);
  assert.notEqual(this.$().text().trim().search(/awesome cohort/), -1);
});

test('can edit user bio', function(assert) {
  let flashmessagesMock = Ember.Service.extend({
    success(message){
      assert.equal(message, 'general.savedSuccessfully');
    }
  });
  this.register('service:currentUser', currentUserMock);
  this.register('service:flashMessages', flashmessagesMock);
  let user = Object.create({
    fullName: 'Test Person Name Thing',
    firstName: 'Test Person',
    middleName: 'Name',
    lastName: 'Thing',
    roles: resolve([]),
    cohorts: resolve([]),
    primaryCohort: resolve(null),
    save(){
      const user = this;
      assert.equal(user.firstName, 'New first Name');
    }
  });

  this.set('user', user);

  this.render(hbs`{{user-profile user=user}}`);
  this.$('.fa-pencil').click();
  return wait().then(() => {
    let inputs = this.$('.user-info input');
    assert.equal(inputs.length, 7);
    assert.equal(inputs.eq(0).val().trim(), 'Test Person');
    assert.equal(inputs.eq(1).val().trim(), 'Name');
    assert.equal(inputs.eq(2).val().trim(), 'Thing');
    inputs.eq(0).val('New first Name');
    inputs.eq(0).trigger('change');
    this.$('.user-info button.done').click();
  });

});
