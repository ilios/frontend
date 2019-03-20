import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | course-clerkship-type', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('course-clerkship-type');
    assert.ok(!!model);
  });
});
