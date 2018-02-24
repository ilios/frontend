import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | editable field', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders value', async function(assert) {
    await render(hbs`{{editable-field value='woot!'}}`);

    assert.equal(this.$().text().trim(), 'woot!');
  });

  test('it renders clickPrompt', async function(assert) {
    await render(hbs`{{editable-field clickPrompt='click me!'}}`);

    assert.equal(this.$().text().trim(), 'click me!');
  });

  test('it renders content', async function(assert) {
    await render(hbs`
      {{#editable-field value='text'}}
         template block text
       {{/editable-field}}
   `);

    assert.equal(this.$().text().trim(), 'text');
    this.$('.editable').click();
    assert.equal(this.$().text().trim(), 'template block text');


  });

  test('it renders an edit icon when it looks empty', async function(assert) {
    const icon = 'i.fa-edit';
    this.set('value', '<p>&nbsp;</p>');
    await render(hbs`{{editable-field value=value}}`);

    assert.equal(this.$().text().trim(), '');
    assert.equal(this.$(icon).length, 1);
  });

  test('save on enter', async function(assert) {
    assert.expect(1);
    this.set('value', 'lorem');
    this.actions.save = () => {
      assert.ok(true, 'save action fired.');
    };
    await render(
      hbs`{{#editable-field save=(action 'save') saveOnEnter=true value=value}}<input value={{value}} oninput={{action (mut value) value="target.value"}}>{{/editable-field}}`
    );
    this.$('.editable').click();
    const e = $.Event("keyup");
    e.which = 13;
    e.keyCode = 13;
    this.$('.editinplace input').trigger(e);
  });

  test('close on escape', async function(assert) {
    assert.expect(1);
    this.set('value', 'lorem');
    this.actions.revert = () => {
      assert.ok(true, 'revert action fired.');
    };
    await render(
      hbs`{{#editable-field close=(action 'revert') closeOnEscape=true value=value}}<input value={{value}} oninput={{action (mut value) value="target.value"}}>{{/editable-field}}`
    );
    this.$('.editable').click();
    const e = $.Event("keyup");
    e.which = 27;
    e.keyCode = 27;
    this.$('.editinplace input').trigger(e);
  });
});