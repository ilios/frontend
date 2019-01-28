import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  find,
  click,
  fillIn
} from '@ember/test-helpers';
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
      assert.dom('.validation-error-message').doesNotExist();
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
      assert.dom('.validation-error-message').exists({ count: 1 });
    });
  });
});
