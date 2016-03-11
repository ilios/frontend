import Ember from 'ember';
import ValidationErrorDisplayMixin from 'ilios/mixins/validation-error-display';
import { module, test } from 'qunit';

module('Unit | Mixin | validation error display');

// Replace this with your real tests.
test('it works', function(assert) {
  let ValidationErrorDisplayObject = Ember.Object.extend(ValidationErrorDisplayMixin);
  let subject = ValidationErrorDisplayObject.create();
  assert.ok(subject);
});
