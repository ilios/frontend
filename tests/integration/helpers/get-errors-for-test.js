import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | get-errors-for', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it calls errorFor', async function (assert) {
    assert.expect(2);
    const obj = {
      getErrorsFor(what) {
        assert.strictEqual(what, 'test');
        return ['foo'];
      },
    };
    this.set('obj', obj);

    await render(hbs`{{get-errors-for this.obj "test"}}`);

    assert.dom(this.element).hasText('foo');
  });

  test('it transforms', async function (assert) {
    assert.expect(2);
    const obj = {
      getErrorsFor(what) {
        assert.strictEqual(what, 'test');
        return ['foo'];
      },
    };
    this.set('obj', obj);

    await render(hbs`{{get-errors-for this.obj.test}}`);

    assert.dom(this.element).hasText('foo');
  });
});
