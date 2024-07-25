import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setLocale, setupIntl } from 'ember-intl/test-support';
import { component } from 'frontend/tests/pages/components/user-guide-link';

module('Integration | Component | user-guide-link', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<UserGuideLink />`);

    assert.ok(component);
    assert.ok(component.icon);
    assert.strictEqual(component.icon.title, 'Ilios User Guide');

    await setLocale('es');
    assert.strictEqual(component.icon.title, 'Ilios Guía de usuario');

    await setLocale('fr');
    assert.strictEqual(component.icon.title, "Ilios Guide d'utilisation");
  });
});
