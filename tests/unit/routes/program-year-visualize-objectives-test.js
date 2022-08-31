import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | program-year-visualize-objectives', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:program-year-visualize-objectives');
    assert.ok(route);
  });
});
