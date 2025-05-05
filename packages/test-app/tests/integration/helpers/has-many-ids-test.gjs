import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import hasManyIds from 'ilios-common/helpers/has-many-ids';

module('Integration | Helper | has-many-ids', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    this.set('model', {
      hasMany(type) {
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
  });
});
