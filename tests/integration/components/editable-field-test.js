import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

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
