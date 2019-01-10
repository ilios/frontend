import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | new competency', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{new-competency}}`);

    assert.dom('input').exists({ count: 1 });
    assert.dom('button').hasText('Add');
  });

  test('save', async function(assert) {
    assert.expect(1);
    this.set('add', (value) => {
      assert.equal(value, 'new co');
    });
    await render(hbs`{{new-competency add=(action add)}}`);
    await fillIn('input', 'new co');
    await click('button');

    return settled();
  });

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);

    await render(hbs`{{new-competency}}`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('validation errors show up when saving', async function(assert) {
    assert.expect(1);

    await render(hbs`{{new-competency}}`);
    await click('button.save');
    assert.dom('.validation-error-message').exists({ count: 1 });
    return settled();
  });
});
