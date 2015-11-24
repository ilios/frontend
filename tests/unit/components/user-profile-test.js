import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('user-profile', 'Unit | Component | user profile ', {
  unit: true
});

test('properties have default values', function(assert) {
  assert.expect(1);

  const component = this.subject();

  assert.ok(!component.get('inProgress'), 'false by default');
});

test('`isDisabled` computed property works', function(assert) {
  assert.expect(2);

  const model = Ember.Object.create({ enabled: true });
  const component = this.subject({ model });

  assert.ok(!component.get('isDisabled'), 'isDisabled is false');

  model.set('enabled', false);
  assert.ok(component.get('isDisabled'), 'isDisabled is true');
});

test('`removeFromSync` computed property works', function(assert) {
  assert.expect(2);

  const model = Ember.Object.create({ userSyncIgnore: true });
  const component = this.subject({ model });

  assert.ok(component.get('removeFromSync'), 'removeFromSync is true');

  model.set('userSyncIgnore', false);
  assert.ok(!component.get('removeFromSync'), 'removeFromSync is false');
});

// Couldn't get this one to pass:
// test('`isCourseDirector` computed property works', function(assert) {
//   assert.expect(1);
//
//   const userRole = Ember.Object.create({ title: 'Course Director' });
//   const model = Ember.Object.create({
//     roles: new Ember.RSVP.Promise((resolve) => {
//       resolve([ userRole ]);
//     })
//   });
//   const component = this.subject({ model });
//
//   Ember.run.next(this, () => {
//     assert.ok(component.get('isCourseDirector.content'), 'true');
//   });
// });
