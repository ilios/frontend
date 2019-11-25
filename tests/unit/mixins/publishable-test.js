import EmberObject from '@ember/object';
import PublishableMixin from 'ilios-common/mixins/publishable';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const PublishableObject = EmberObject.extend(PublishableMixin);
    const subject = PublishableObject.create();
    assert.ok(subject);
  });
});
