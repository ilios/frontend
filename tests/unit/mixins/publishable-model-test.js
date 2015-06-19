import Ember from 'ember';
import PublishableModelMixin from '../../../mixins/publishable-model';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable model');

// Replace this with your real tests.
test('it works', function(assert) {
  var PublishableModelObject = Ember.Object.extend(PublishableModelMixin);
  var subject = PublishableModelObject.create();
  assert.ok(subject);
});
