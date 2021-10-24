import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | get-errors-for', function (hooks) {
  setupRenderingTest(hooks);

  test('it calls errorFor', async function (assert) {
    assert.expect(2);
    const obj = {
      getErrorsFor(what) {
        assert.equal(what, 'test');
        return ['foo'];
      },
    };
    this.set('obj', obj);

    await render(hbs`{{get-errors-for this.obj "test"}}`);

    assert.dom(this.element).hasText('foo');
  });
});
