import EmberObject from '@ember/object';
import PublishableMixin from '../../../mixins/publishable';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    var PublishableObject = EmberObject.extend(PublishableMixin);
    var subject = PublishableObject.create();
    assert.ok(subject);
  });
});