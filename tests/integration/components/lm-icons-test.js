import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios-common/page-objects/components/lm-icons';

module('Integration | Component | lm-icons', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders optional', async function (assert) {
    this.set('lm', { type: 'link' });
    await render(hbs`<LmIcons @learningMaterial={{this.lm}} />`);
    assert.ok(component.type.isLink);
    assert.notOk(component.isRequired);
  });

  test('it renders required', async function (assert) {
    this.set('lm', { type: 'citation', required: true });
    await render(hbs`<LmIcons @learningMaterial={{this.lm}} />`);
    assert.ok(component.type.isCitation);
    assert.ok(component.isRequired);
  });
});
