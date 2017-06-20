import Ember from 'ember';
import TooltipContentMixin from 'ilios-common/mixins/tooltip-content';
import { module, skip } from 'qunit';

module('Unit | Mixin | tooltip content');

skip('it works', function(assert) {
  let TooltipContentObject = Ember.Object.extend(TooltipContentMixin);
  let subject = TooltipContentObject.create();
  assert.ok(subject);
});
