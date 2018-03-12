import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('competency-title-editor', 'Integration | Component | competency title editor', {
  integration: true
});

test('validation errors do not show up initially', function(assert) {
  assert.expect(1);
  let competency = EmberObject.create({
    title: 'test'
  });
  this.set('competency', competency);
  this.render(hbs`{{competency-title-editor competency=competency}}`);
  return wait().then(()=>{
    assert.equal(this.$('.validation-error-message').length, 0);
  });
});

test('validation errors show up when saving', function(assert) {
  assert.expect(1);
  let competency = EmberObject.create({
    title: 'test'
  });
  this.set('competency', competency);
  this.render(hbs`{{competency-title-editor competency=competency}}`);
  this.$('.content span:eq(0)').click();
  this.$('input').val('').trigger('input');
  this.$('button.done').click();
  return wait().then(()=>{
    assert.equal(this.$('.validation-error-message').length, 1);
  });
});
