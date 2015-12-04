import PublishableModelMixin from '../../../mixins/publishable-model';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

module('Unit | Mixin | publishable model' + testgroup);

// Replace this with your real tests.
test('it works', function(assert) {
  var PublishableModelObject = Ember.Object.extend(PublishableModelMixin);
  var subject = PublishableModelObject.create();
  assert.ok(subject);
});
