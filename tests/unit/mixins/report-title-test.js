import EmberObject from '@ember/object';
import ReportTitleMixin from 'ilios/mixins/report-title';
import { module, test } from 'qunit';

module('Unit | Mixin | report title', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let ReportTitleObject = EmberObject.extend(ReportTitleMixin);
    let subject = ReportTitleObject.create();
    assert.ok(subject);
  });
});