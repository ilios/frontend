import EmberObject from '@ember/object';
import TooltipContentMixin from 'ilios-common/mixins/tooltip-content';
import { module, skip } from 'qunit';

module('Unit | Mixin | tooltip content', function() {
  skip('it works', function(assert) {
    const TooltipContentObject = EmberObject.extend(TooltipContentMixin);
    const subject = TooltipContentObject.create();
    assert.ok(subject);
  });
});
