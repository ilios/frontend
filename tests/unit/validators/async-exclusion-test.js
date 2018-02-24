import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | async-exclusion', function(hooks) {
  setupTest(hooks);

  test('it works', function(assert) {
    var validator = this.owner.lookup('validator:async-exclusion');
    assert.ok(validator);
  });
});