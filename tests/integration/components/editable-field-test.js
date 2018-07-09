import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | editable field', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders value', async function(assert) {
    await render(hbs`{{editable-field value='woot!'}}`);

    assert.equal(this.element.textContent.trim(), 'woot!');
  });

  test('it renders clickPrompt', async function(assert) {
    await render(hbs`{{editable-field clickPrompt='click me!'}}`);

    assert.equal(this.element.textContent.trim(), 'click me!');
  });

  test('it renders content', async function(assert) {
    await render(hbs`
      {{#editable-field value='text'}}
         template block text
       {{/editable-field}}
   `);

    assert.equal(this.element.textContent.trim(), 'text');
    await click('.editable');
    assert.equal(this.element.textContent.trim(), 'template block text');


  });

  test('it renders an edit icon when it looks empty', async function(assert) {
    const icon = 'i.fa-edit';
    this.set('value', '<p>&nbsp;</p>');
    await render(hbs`{{editable-field value=value}}`);

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(findAll(icon).length, 1);
  });

  test('save on enter', async function(assert) {
    assert.expect(1);
    this.set('value', 'lorem');
    this.set('save', () => {
      assert.ok(true, 'save action fired.');
    });
    await render(
      hbs`{{#editable-field save=(action save) saveOnEnter=true value=value}}<input value={{value}} oninput={{action (mut value) value="target.value"}}>{{/editable-field}}`
    );
    await click('.editable');
    await triggerKeyEvent('.editinplace input', 'keyup', 13);
  });

  test('close on escape', async function(assert) {
    assert.expect(1);
    this.set('value', 'lorem');
    this.set('revert', () => {
      assert.ok(true, 'revert action fired.');
    });
    await render(
      hbs`{{#editable-field close=(action revert) closeOnEscape=true value=value}}<input value={{value}} oninput={{action (mut value) value="target.value"}}>{{/editable-field}}`
    );
    await click('.editable');
    await triggerKeyEvent('.editinplace input', 'keyup', 27);
  });
});
