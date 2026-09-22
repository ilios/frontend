import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { module, test } from 'qunit';
import { setupRenderingTest, takeComponentScreenshot } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import component from 'frontend/tests/pages/components/user-profile/locale-chooser';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import LocaleChooser from 'frontend/components/user-profile/locale-chooser';
import { setupIntl, setLocale } from 'ember-intl/test-support';

module('Integration | Component | user-profile/locale-chooser', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders and is accessible', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.title, 'Languages');
    assert.strictEqual(component.choices.length, 3);
    assert.strictEqual(component.choices[0].label, 'English (en)');
    assert.ok(component.choices[0].isActive);
    assert.strictEqual(component.choices[1].label, 'Español (es)');
    assert.notOk(component.choices[1].isActive);
    assert.strictEqual(component.choices[2].label, 'Français (fr)');
    assert.notOk(component.choices[2].isActive);

    await takeComponentScreenshot(assert);
  });

  test('changing locale', async function (assert) {
    class PreferencesMock extends Service {
      @tracked locale = 'en-us';
      async setLocale(loc) {
        this.locale = loc;
        assert.step(`Changed to ${loc}`);
      }
    }

    this.owner.register('service:preferences', PreferencesMock);
    const preferences = this.owner.lookup('service:preferences');

    await render(<template><LocaleChooser /></template>);
    assert.ok(component.choices[0].isActive);
    assert.strictEqual(preferences.locale, 'en-us');
    await component.choices[1].choose();
    assert.ok(component.choices[1].isActive);
    assert.ok(component.choices[1].isChecked);
    assert.strictEqual(preferences.locale, 'es');
    await component.choices[2].choose();
    assert.ok(component.choices[2].isActive);
    assert.ok(component.choices[2].isChecked);
    assert.strictEqual(preferences.locale, 'fr');
    await component.choices[0].choose();
    assert.ok(component.choices[0].isActive);
    assert.ok(component.choices[0].isChecked);
    assert.strictEqual(preferences.locale, 'en-us');
    assert.verifySteps(['Changed to es', 'Changed to fr', 'Changed to en-us']);
  });

  test('use untranslated locale', async function (assert) {
    await setLocale('de');
    await render(<template><LocaleChooser /></template>);
    assert.strictEqual(component.choices.length, 4);

    assert.strictEqual(component.choices[0].label, 't:general.language.en-us');
    assert.strictEqual(component.choices[1].label, 't:general.language.es');
    assert.strictEqual(component.choices[2].label, 't:general.language.fr');
    assert.strictEqual(component.choices[3].label, 'de');
  });

  test('locale is not set when selecting the current locale', async function (assert) {
    class PreferencesMock extends Service {
      @tracked locale = 'fr';
      async setLocale(loc) {
        assert.step(`Changed to ${loc}`);
      }
    }

    this.owner.register('service:preferences', PreferencesMock);
    await render(<template><LocaleChooser /></template>);
    assert.ok(component.choices[2].isActive);
    assert.ok(component.choices[2].isChecked);
    await component.choices[2].choose();
    assert.ok(component.choices[2].isActive);
    assert.ok(component.choices[2].isChecked);
    assert.verifySteps([]);
  });
});
