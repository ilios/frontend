import Ember from 'ember';
import ValidationErrorDisplayMixin from 'ilios/mixins/validation-error-display';
import { module, test } from 'qunit';

module('Unit | Mixin | validation error display');

test('it works', function(assert) {
  let ValidationErrorDisplayObject = Ember.Object.extend(ValidationErrorDisplayMixin);
  let subject = ValidationErrorDisplayObject.create();
  assert.ok(subject);
});

test('starts off empty', function(assert) {
  let ValidationErrorDisplayObject = Ember.Object.extend(ValidationErrorDisplayMixin);
  let subject = ValidationErrorDisplayObject.create();
  assert.equal(subject.get('showErrorsFor').length, 0);
});
