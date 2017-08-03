import Ember from 'ember';
import ReportTitleMixin from 'ilios/mixins/report-title';
import { module, test } from 'qunit';

module('Unit | Mixin | report title');

// Replace this with your real tests.
test('it works', function(assert) {
  let ReportTitleObject = Ember.Object.extend(ReportTitleMixin);
  let subject = ReportTitleObject.create();
  assert.ok(subject);
});
