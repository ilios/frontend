import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:async-exclusion', 'Unit | Validator | async-exclusion', {
  needs: ['service:i18n', 'validator:messages']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});
