import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setLocale, setupIntl } from 'ember-intl/test-support';

module('Integration | Component | user-guide-link', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<UserGuideLink />`);

    assert.dom('[data-test-user-guide-link]').exists();
    assert.dom('[data-test-user-guide-link-icon]').exists();
    assert.dom('[data-test-user-guide-link-icon]').hasText('Ilios User Guide');

    await setLocale('es');

    assert.dom('[data-test-user-guide-link-icon]').hasText('Ilios Guía de usuario');

    await setLocale('fr');

    assert.dom('[data-test-user-guide-link-icon]').hasText("Ilios Guide d'utilisation");
  });
});
