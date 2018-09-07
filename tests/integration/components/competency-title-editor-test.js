import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, click, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competency title editor', function(hooks) {
  setupRenderingTest(hooks);

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);
    let competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`{{competency-title-editor competency=competency canUpdate=true}}`);
    return settled().then(()=>{
      assert.equal(findAll('.validation-error-message').length, 0);
    });
  });

  test('validation errors show up when saving', async function(assert) {
    assert.expect(1);
    let competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`{{competency-title-editor competency=competency canUpdate=true}}`);
    await click(find('.content span'));
    await fillIn('input', '');
    await click('button.done');
    return settled().then(()=>{
      assert.equal(findAll('.validation-error-message').length, 1);
    });
  });
});
