import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | on-update', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    assert.expect(6);

    this.someMethod = (element, value) => {
      assert.strictEqual(element.tagName, 'DIV', 'correct element tagName');
      assert.strictEqual(element.id, 'cool-element', 'correct element ID');
      assert.strictEqual(value, this.boundValue);
    };

    this.set('boundValue', 'val1');
    await render(hbs`<div id='cool-element' {{on-update this.someMethod this.boundValue}}></div>`);

    this.set('boundValue', 'val2');
  });
});
