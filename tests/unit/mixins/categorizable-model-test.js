import CategorizableModelMixin from '../../../mixins/categorizable-model';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';

module('Unit | Mixin | categorizable model' + testgroup);

// Replace this with your real tests.
test('it works', function(assert) {
  var CategorizableModelMixin = Ember.Object.extend(CategorizableModelMixin);
  var subject = CategorizableModelMixin.create();
  assert.ok(subject);
});
