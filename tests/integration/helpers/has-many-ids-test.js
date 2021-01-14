import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | has-many-ids', function (hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function (assert) {
    this.set('model', {
      hasMany(type) {
        assert.equal(type, 'foo');
        return {
          ids() {
            return [1, 2];
          },
        };
      },
    });

    await render(hbs`{{has-many-ids this.model "foo"}}`);

    assert.equal(this.element.textContent.trim(), '1,2');
  });
});
