import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competency title editor', function(hooks) {
  setupRenderingTest(hooks);

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);
    const competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`<CompetencyTitleEditor @competency={{this.competency}} @canUpdate={{true}} />`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('validation errors show up when blank', async function(assert) {
    assert.expect(1);
    const competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`<CompetencyTitleEditor @competency={{this.competency}} @canUpdate={{true}} />`);
    await click('[data-test-edit]');
    await fillIn('input', '');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 });
  });

  test('validation errors show up when too long', async function(assert) {
    assert.expect(1);
    const competency = EmberObject.create({
      title: 'test'
    });
    this.set('competency', competency);
    await render(hbs`<CompetencyTitleEditor @competency={{this.competency}} @canUpdate={{true}} />`);
    await click('[data-test-edit]');
    await fillIn('input', 'tooLong'.repeat(50));
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 });
  });
});
