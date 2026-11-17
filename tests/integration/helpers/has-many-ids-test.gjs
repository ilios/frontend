import { render } from '@ember/test-helpers';
import hasManyIds from 'frontend/helpers/has-many-ids';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Helper | has-many-ids', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('model', {
      hasMany(type) {
        assert.step('hasMany called');
        assert.strictEqual(type, 'foo');
        return {
          ids() {
            return [1, 2];
          },
        };
      },
    });

    await render(<template>{{hasManyIds this.model "foo"}}</template>);

    assert.dom(this.element).hasText('1,2');
    assert.verifySteps(['hasMany called']);
  });
});
