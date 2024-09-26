import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | has-many-ids', function (hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
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

    await render(hbs`{{has-many-ids this.model 'foo'}}`);

    assert.dom(this.element).hasText('1,2');
  });
});
