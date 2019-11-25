import EmberObject from '@ember/object';
import PublishableModelMixin from 'ilios-common/mixins/publishable-model';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable model', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const PublishableModelObject = EmberObject.extend(PublishableModelMixin);
    const subject = PublishableModelObject.create();
    assert.ok(subject);
  });
});
