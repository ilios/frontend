import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Route | course-visualize-instructors', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:course-visualize-instructors');
    assert.ok(route);
  });
});
