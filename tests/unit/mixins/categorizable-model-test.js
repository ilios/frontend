import EmberObject from '@ember/object';
import CategorizableModelMixin from 'ilios-common/mixins/categorizable-model';
import { module, test } from 'qunit';

module('Unit | Mixin | categorizable model', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const CategorizableModelObject = EmberObject.extend(CategorizableModelMixin);
    const subject = CategorizableModelObject.create();
    assert.ok(subject);
  });
});
