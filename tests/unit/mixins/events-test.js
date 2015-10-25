import Ember from 'ember';
import EventMixin from '../../../mixins/events';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

module('Unit | Mixin | events' + testgroup);

// Replace this with your real tests.
test('it works', function(assert) {
  var EventObject = Ember.Object.extend(EventMixin);
  var subject = EventObject.create();
  assert.ok(subject);
});
