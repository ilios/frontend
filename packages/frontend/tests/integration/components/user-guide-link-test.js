import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | user-guide-link', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<UserGuideLink />`);

    assert.dom('.user-guide-link').exists();
    assert.dom('.user-guide-link svg.fa-circle-question').exists();
    assert.dom('.user-guide-link svg.fa-circle-question title').hasText('Ilios User Guide');

    this.owner.lookup('service:intl').setLocale('es');
    await settled();

    assert.dom('.user-guide-link svg.fa-circle-question title').hasText('Ilios Guía de usuario');

    this.owner.lookup('service:intl').setLocale('fr');
    await settled();

    assert
      .dom('.user-guide-link svg.fa-circle-question title')
      .hasText("Ilios Guide d'utilisation");
  });
});
