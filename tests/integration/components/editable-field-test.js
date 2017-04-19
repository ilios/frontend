import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('editable-field', 'Integration | Component | editable field', {
  integration: true
});

test('it renders value', function(assert) {
  this.render(hbs`{{editable-field value='woot!'}}`);

  assert.equal(this.$().text().trim(), 'woot!');
});

test('it renders clickPrompt', function(assert) {
  this.render(hbs`{{editable-field clickPrompt='click me!'}}`);

  assert.equal(this.$().text().trim(), 'click me!');
});

test('it renders content', function(assert) {
  this.render(hbs`
    {{#editable-field value='text'}}
       template block text
     {{/editable-field}}
 `);

  assert.equal(this.$().text().trim(), 'text');
  this.$('.editable').click();
  assert.equal(this.$().text().trim(), 'template block text');


});

test('it renders an edit icon when it looks empty', function(assert) {
  const icon = 'i.fa-edit';
  this.set('value', '<p>&nbsp;</p>');
  this.render(hbs`{{editable-field value=value}}`);

  assert.equal(this.$().text().trim(), '');
  assert.equal(this.$(icon).length, 1);
});

test('placed focus in the input element', async function(assert) {
  const el = 'input';
  const editable = '.editable';
  this.render(hbs`
    {{#editable-field value='text'}}
       <input>
     {{/editable-field}}
 `);

  assert.equal(this.$().text().trim(), 'text');
  this.$(editable).click();
  await wait();
  assert.ok(this.$(el).is(":focus"));
});

test('placed focus in the select element', async function(assert) {
  const el = 'select';
  const editable = '.editable';
  this.render(hbs`
    {{#editable-field value='text'}}
       <select></select>
     {{/editable-field}}
 `);

  assert.equal(this.$().text().trim(), 'text');
  this.$(editable).click();
  await wait();
  assert.ok(this.$(el).is(":focus"));
});

test('placed focus in the textarea element', async function(assert) {
  const el = 'textarea';
  const editable = '.editable';
  this.render(hbs`
    {{#editable-field value='text'}}
       <textarea></textarea>
     {{/editable-field}}
 `);

  assert.equal(this.$().text().trim(), 'text');
  this.$(editable).click();
  await wait();
  assert.ok(this.$(el).is(":focus"));
});
