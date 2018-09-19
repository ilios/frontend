import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | yes-no', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders yes', async function (assert) {
    await render(hbs`{{yes-no value=true}}`);
    assert.dom(this.element).hasText('Yes');
    assert.dom(this.element.querySelector('span')).hasClass('yes');
  });

  test('it renders no', async function (assert) {
    await render(hbs`{{yes-no value=false}}`);
    assert.dom(this.element).hasText('No');
    assert.dom(this.element.querySelector('span')).hasClass('no');
  });
});
