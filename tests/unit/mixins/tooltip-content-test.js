import EmberObject from '@ember/object';
import TooltipContentMixin from 'ilios-common/mixins/tooltip-content';
import { module, skip } from 'qunit';

module('Unit | Mixin | tooltip content');

skip('it works', function(assert) {
  let TooltipContentObject = EmberObject.extend(TooltipContentMixin);
  let subject = TooltipContentObject.create();
  assert.ok(subject);
});
