import Service from '@ember/service';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest, takeComponentScreenshot } from 'frontend/tests/helpers';
import { setupMSW } from 'ilios-common/msw';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import ThemeChooser from 'frontend/components/user-profile/theme-chooser';
import { component } from 'frontend/tests/pages/components/user-profile/theme-chooser';

module('Integration | Component | user-profile/theme-chooser', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders and is accessible', async function (assert) {
    class PreferencesMock extends Service {
      theme = 'system';
    }

    class CurrentUserMock extends Service {
      performsNonLearnerFunction = false;
    }

    this.owner.register('service:preferences', PreferencesMock);
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><ThemeChooser /></template>);

    assert.strictEqual(component.title, 'Theme');
    assert.strictEqual(component.choices.length, 3);
    assert.strictEqual(component.choices[0].label, 'System');
    assert.strictEqual(component.choices[1].label, 'Light');
    assert.strictEqual(component.choices[2].label, 'Dark');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await takeComponentScreenshot(assert);
  });

  test('it displays the selected theme', async function (assert) {
    class PreferencesMock extends Service {
      theme = 'dark';
    }

    class CurrentUserMock extends Service {
      performsNonLearnerFunction = false;
    }

    this.owner.register('service:preferences', PreferencesMock);
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><ThemeChooser /></template>);

    assert.false(component.choices[0].isActive);
    assert.false(component.choices[0].isChecked);

    assert.false(component.choices[1].isActive);
    assert.false(component.choices[1].isChecked);

    assert.true(component.choices[2].isActive);
    assert.true(component.choices[2].isChecked);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await takeComponentScreenshot(assert);
  });

  test('it changes the theme', async function (assert) {
    class PreferencesMock extends Service {
      theme = 'system';

      async setTheme(theme) {
        assert.strictEqual(theme, 'dark');
        this.theme = theme;
        assert.step('Theme Changed');
      }
    }

    class CurrentUserMock extends Service {
      performsNonLearnerFunction = false;
    }

    this.owner.register('service:preferences', PreferencesMock);
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><ThemeChooser /></template>);

    await component.choices[2].choose();

    assert.strictEqual(
      this.owner.lookup('service:preferences').theme,
      'dark',
      'updates the preference',
    );
    assert.true(component.choices[2].isChecked);
    assert.verifySteps(['Theme Changed']);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await takeComponentScreenshot(assert);
  });

  test('it does not set the theme when selecting the current theme', async function (assert) {
    class PreferencesMock extends Service {
      theme = 'dark';

      async setTheme() {
        assert.step('Theme Changed');
      }
    }

    class CurrentUserMock extends Service {
      performsNonLearnerFunction = false;
    }

    this.owner.register('service:preferences', PreferencesMock);
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><ThemeChooser /></template>);

    await component.choices[2].choose();

    assert.verifySteps([]);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await takeComponentScreenshot(assert);
  });
});
