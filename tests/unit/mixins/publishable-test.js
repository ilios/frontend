import EmberObject from '@ember/object';
import PublishableMixin from 'ilios-common/mixins/publishable';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let PublishableObject = EmberObject.extend(PublishableMixin);
    let subject = PublishableObject.create();
    assert.ok(subject);
  });
});
