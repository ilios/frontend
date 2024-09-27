import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | has-error-for', function (hooks) {
  setupRenderingTest(hooks);

  test('it calls hasError', async function (assert) {
    assert.expect(2);
    const obj = {
      hasErrorFor(what) {
        assert.strictEqual(what, 'test');
        return true;
      },
    };
    this.set('obj', obj);

    await render(hbs`{{has-error-for this.obj 'test'}}`);

    assert.dom(this.element).hasText('true');
  });

  test('it works in pre-transformed style', async function (assert) {
    assert.expect(2);
    const obj = {
      hasErrorFor(what) {
        assert.strictEqual(what, 'test');
        return true;
      },
    };
    this.set('obj', obj);

    await render(hbs`{{has-error-for this.obj.test}}`);

    assert.dom(this.element).hasText('true');
  });
});
