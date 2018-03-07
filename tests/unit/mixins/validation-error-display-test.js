import EmberObject from '@ember/object';
import ValidationErrorDisplayMixin from 'ilios/mixins/validation-error-display';
import { module, test } from 'qunit';

module('Unit | Mixin | validation error display', function() {
  test('it works', function(assert) {
    let ValidationErrorDisplayObject = EmberObject.extend(ValidationErrorDisplayMixin);
    let subject = ValidationErrorDisplayObject.create();
    assert.ok(subject);
  });

  test('starts off empty', function(assert) {
    let ValidationErrorDisplayObject = EmberObject.extend(ValidationErrorDisplayMixin);
    let subject = ValidationErrorDisplayObject.create();
    assert.equal(subject.get('showErrorsFor').length, 0);
  });
});
