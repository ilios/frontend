import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object } = Ember;

moduleForComponent('competency-title-editor', 'Integration | Component | competency title editor', {
  integration: true
});

test('validation errors do not show up initially', function(assert) {
  assert.expect(1);
  let competency = Object.create({
    title: 'test'
  });
  this.set('competency', competency);
  this.render(hbs`{{competency-title-editor competency=competency}}`);
  assert.equal(this.$('.validation-error-message').length, 0);
});

test('validation errors show up when saving', function(assert) {
  assert.expect(1);
  let competency = Object.create({
    title: 'test'
  });
  this.set('competency', competency);
  this.render(hbs`{{competency-title-editor competency=competency}}`);
  this.$('.content span:eq(0)').click();
  this.$('input').val('').change();
  this.$('button.done').click();
  assert.equal(this.$('.validation-error-message').length, 1);
  return wait();
});
