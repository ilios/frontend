import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competency title editor', function(hooks) {
  setupRenderingTest(hooks);

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);
    let competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`{{competency-title-editor competency=competency}}`);
    return settled().then(()=>{
      assert.equal(this.$('.validation-error-message').length, 0);
    });
  });

  test('validation errors show up when saving', async function(assert) {
    assert.expect(1);
    let competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`{{competency-title-editor competency=competency}}`);
    this.$('.content span:eq(0)').click();
    this.$('input').val('').trigger('input');
    this.$('button.done').click();
    return settled().then(()=>{
      assert.equal(this.$('.validation-error-message').length, 1);
    });
  });
});