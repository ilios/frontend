import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Route | course-visualize-vocabularies', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:course-visualize-vocabularies');
    assert.ok(route);
  });
});
