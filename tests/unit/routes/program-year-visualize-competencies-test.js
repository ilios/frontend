import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | program-year-visualize-competencies', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:program-year-visualize-competencies');
    assert.ok(route);
  });
});
