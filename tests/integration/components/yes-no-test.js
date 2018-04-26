import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | yes-no', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders yes', async function (assert) {
    await render(hbs`{{yes-no value=true}}`);
    assert.equal(this.element.textContent.trim(), 'Yes');
    assert.ok(this.element.querySelector('span').classList.contains('yes'));
  });

  test('it renders no', async function (assert) {
    await render(hbs`{{yes-no value=false}}`);
    assert.equal(this.element.textContent.trim(), 'No');
    assert.ok(this.element.querySelector('span').classList.contains('no'));
  });
});
