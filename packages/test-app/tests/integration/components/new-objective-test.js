import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | new objective', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('cancel', () => {});

    await render(hbs`<NewObjective @cancel={{this.cancel}} />`);
    const content = this.element.textContent.trim();
    assert.ok(content.includes('New Objective'));
    assert.ok(content.includes('Description'));
  });

  test('errors do not show up initially', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`<NewObjective @cancel={{this.cancel}} />`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('errors show up', async function (assert) {
    assert.expect(2);
    this.set('cancel', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`<NewObjective @cancel={{this.cancel}} />`);
    await click('.done');
    assert.dom('.validation-error-message').exists();
    assert.dom('.validation-error-message').includesText('blank');
  });
});
