import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | new program', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);
    this.set('cancel', () => {});
    this.set('save', () => {});

    await render(hbs`{{new-program save=(action save) cancel=(action cancel)}}`);

    const titleLabel = find('[data-test-newprogram-title] label');
    const titleInput = find('[data-test-newprogram-title] input');
    const saveBtn = find('.buttons .done');
    const cancelBtn = find('.buttons .cancel');
    assert.dom(titleLabel).hasText('Title:');
    assert.ok(titleInput);
    assert.ok(saveBtn);
    assert.ok(cancelBtn);
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel fired.');
    });
    this.set('save', () => {});

    await render(hbs`{{new-program save=(action save) cancel=(action cancel)}}`);
    const cancelBtn = find('.buttons .cancel');
    click(cancelBtn);
  });

  test('validation fails, no title', async function (assert) {
    assert.expect(2);
    this.set('cancel', () => {});
    this.set('save', () => {});

    await render(hbs`{{new-program save=(action save) cancel=(action cancel)}}`);
    const saveBtn = find('.buttons .done');
    const validationError = '[data-test-newprogram-title] .validation-error-message';
    assert.notOk(find(validationError));
    await click(saveBtn);
    assert.dom(find(validationError)).hasText('This field can not be blank');
  });

  test('validation fails, title too short', async function (assert) {
    assert.expect(2);
    this.set('cancel', () => {});
    this.set('save', () => {});

    await render(hbs`{{new-program save=(action save) cancel=(action cancel)}}`);
    const saveBtn = find('.buttons .done');
    const titleInput = find('[data-test-newprogram-title] input');
    const validationError = '[data-test-newprogram-title] .validation-error-message';
    assert.notOk(find(validationError));
    fillIn(titleInput, 'Aa');
    await click(saveBtn);
    assert.dom(find(validationError)).hasText('Title is too short (minimum is 3 characters)');
  });

  test('validation fails, title too long', async function (assert) {
    assert.expect(2);
    this.set('cancel', () => {});
    this.set('save', () => {});

    await render(hbs`{{new-program save=(action save) cancel=(action cancel)}}`);
    const saveBtn = find('.buttons .done');
    const titleInput = find('[data-test-newprogram-title] input');
    let validationError = '[data-test-newprogram-title] .validation-error-message';
    assert.notOk(find(validationError));
    fillIn(titleInput, '0123456789'.repeat(21));
    await click(saveBtn);
    assert.dom(find(validationError)).hasText('Title is too long (maximum is 200 characters)');
  });

  test('save', async function (assert) {
    assert.expect(5);
    this.set('cancel', () => {});
    this.set('save', async (program) => {
      assert.equal(program.get('title'), 'foobar');
      assert.equal(program.get('published'), true);
      assert.equal(program.get('publishedAsTbd'), false);
    });

    await render(hbs`{{new-program save=(action save) cancel=(action cancel)}}`);
    const saveBtn = find('.buttons .done');
    const titleInput = find('[data-test-newprogram-title] input');
    let validationError = '[data-test-newprogram-title] .validation-error-message';
    assert.notOk(find(validationError));
    fillIn(titleInput, 'foobar');
    await click(saveBtn);
    assert.notOk(find(validationError));
  });
});
