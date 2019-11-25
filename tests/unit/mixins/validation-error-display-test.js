import EmberObject from '@ember/object';
import ValidationErrorDisplayMixin from 'ilios-common/mixins/validation-error-display';
import { module, test } from 'qunit';

module('Unit | Mixin | validation error display', function() {
  test('it works', function(assert) {
    const ValidationErrorDisplayObject = EmberObject.extend(ValidationErrorDisplayMixin);
    const subject = ValidationErrorDisplayObject.create();
    assert.ok(subject);
  });

  test('starts off empty', function(assert) {
    const ValidationErrorDisplayObject = EmberObject.extend(ValidationErrorDisplayMixin);
    const subject = ValidationErrorDisplayObject.create();
    assert.equal(subject.get('showErrorsFor').length, 0);
  });
});
