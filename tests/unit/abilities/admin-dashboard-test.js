import { moduleFor, test } from 'ember-qunit';

moduleFor('ability:adminDashboard', 'Unit | Ability | adminDashboard', {
  needs: ['service:currentUser']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var ability = this.subject();
  assert.ok(ability);
});
