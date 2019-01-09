import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | new objective', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('cancel', () => {});

    await render(hbs`{{new-objective cancel=(action cancel)}}`);
    let content = this.element.textContent.trim();
    assert.ok(content.includes('New Objective'));
    assert.ok(content.includes('Description'));
  });

  test('errors do not show up initially', async function(assert) {
    this.set('cancel', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`{{new-objective cancel=(action cancel)}}`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('errors show up', async function(assert) {
    this.set('cancel', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`{{new-objective cancel=(action cancel)}}`);
    await click('.done');
    let boxes = findAll('.form-data');
    assert.ok(boxes[0].textContent.includes('blank'));
  });
});
