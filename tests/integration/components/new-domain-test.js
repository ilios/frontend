import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('new-domain', 'Integration | Component | new domain', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{new-domain}}`);

  assert.equal(this.$('label').text().trim(), 'New Domain');
  assert.equal(this.$('input').length, 1);
  assert.equal(this.$('button').text().trim(), 'Add');
});

test('add new domain', function(assert) {
  assert.expect(1);
  this.set('add', (value) => {
    assert.equal(value, 'new domain');
  });
  this.render(hbs`{{new-domain add=(action add)}}`);
  this.$('input').val('new domain').change();
  this.$('button').click();

  return wait();
});

test('validation errors do not show up initially', function(assert) {
  assert.expect(1);

  this.render(hbs`{{new-domain}}`);
  assert.equal(this.$('.validation-error-message').length, 0);
});

test('validation errors show up when saving', function(assert) {
  assert.expect(1);

  this.render(hbs`{{new-domain}}`);
  this.$('button.save').click();
  assert.equal(this.$('.validation-error-message').length, 1);
  return wait();
});
