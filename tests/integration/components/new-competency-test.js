import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('new-competency', 'Integration | Component | new competency', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{new-competency}}`);

  assert.equal(this.$('input').length, 1);
  assert.equal(this.$('button').text().trim(), 'Add');
});

test('save', function(assert) {
  assert.expect(1);
  this.set('add', (value) => {
    assert.equal(value, 'new co');
  });
  this.render(hbs`{{new-competency add=(action add)}}`);
  this.$('input').val('new co').trigger('input');
  this.$('button').click();

  return wait();
});

test('validation errors do not show up initially', function(assert) {
  assert.expect(1);

  this.render(hbs`{{new-competency}}`);
  assert.equal(this.$('.validation-error-message').length, 0);
});

test('validation errors show up when saving', function(assert) {
  assert.expect(1);

  this.render(hbs`{{new-competency}}`);
  this.$('button.save').click();
  assert.equal(this.$('.validation-error-message').length, 1);
  return wait();
});
