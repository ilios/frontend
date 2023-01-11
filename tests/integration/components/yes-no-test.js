import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/yes-no';

module('Integration | Component | yes-no', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders yes', async function (assert) {
    await render(hbs`<YesNo @value={{true}} />`);
    assert.strictEqual(component.text, 'Yes');
    assert.ok(component.yes);
    assert.notOk(component.no);
  });

  test('it renders no', async function (assert) {
    await render(hbs`<YesNo @value={{false}} />`);
    assert.strictEqual(component.text, 'No');
    assert.notOk(component.yes);
    assert.ok(component.no);
  });
});
