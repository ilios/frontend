import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | new competency', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{new-competency}}`);

    assert.equal(findAll('input').length, 1);
    assert.equal(find('button').textContent.trim(), 'Add');
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
    assert.equal(findAll('.validation-error-message').length, 0);
  });

  test('validation errors show up when saving', async function(assert) {
    assert.expect(1);

    await render(hbs`{{new-competency}}`);
    await click('button.save');
    assert.equal(findAll('.validation-error-message').length, 1);
    return settled();
  });
});
