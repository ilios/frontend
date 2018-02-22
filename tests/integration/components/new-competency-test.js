import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | new competency', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{new-competency}}`);

    assert.equal(this.$('input').length, 1);
    assert.equal(this.$('button').text().trim(), 'Add');
  });

  test('save', async function(assert) {
    assert.expect(1);
    this.set('add', (value) => {
      assert.equal(value, 'new co');
    });
    await render(hbs`{{new-competency add=(action add)}}`);
    this.$('input').val('new co').trigger('input');
    this.$('button').click();

    return settled();
  });

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);

    await render(hbs`{{new-competency}}`);
    assert.equal(this.$('.validation-error-message').length, 0);
  });

  test('validation errors show up when saving', async function(assert) {
    assert.expect(1);

    await render(hbs`{{new-competency}}`);
    this.$('button.save').click();
    assert.equal(this.$('.validation-error-message').length, 1);
    return settled();
  });
});