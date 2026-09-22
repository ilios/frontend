import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setLocale, setupIntl } from 'ember-intl/test-support';
import { component } from 'frontend/tests/pages/components/user-guide-link';
import UserGuideLink from 'frontend/components/user-guide-link';

module('Integration | Component | user-guide-link', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.intl = this.owner.lookup('service:intl');

    await render(<template><UserGuideLink /></template>);

    assert.ok(component);
    assert.ok(component.icon);
    assert.strictEqual(component.title, this.intl.t('general.iliosUserGuide'));

    await setLocale('es');
    assert.strictEqual(component.title, this.intl.t('general.iliosUserGuide'));

    await setLocale('fr');
    assert.strictEqual(component.title, this.intl.t('general.iliosUserGuide'));
  });
});
