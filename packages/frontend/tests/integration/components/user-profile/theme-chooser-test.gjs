import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/user-profile/theme-chooser';
import ThemeChooser from 'frontend/components/user-profile/theme-chooser';

module('Integration | Component | user-profile/theme-chooser', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
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
  });

  test('it displays student theme images for learners', async function (assert) {
    class PreferencesMock extends Service {
      theme = 'system';
    }

    class CurrentUserMock extends Service {
      performsNonLearnerFunction = false;
    }

    this.owner.register('service:preferences', PreferencesMock);
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><ThemeChooser /></template>);

    assert.strictEqual(component.choices[0].studentPreviews.length, 2);
    assert.strictEqual(component.choices[0].nonStudentPreviews.length, 0);
    assert.strictEqual(component.choices[1].studentPreviews.length, 1);
    assert.strictEqual(component.choices[1].nonStudentPreviews.length, 0);
    assert.strictEqual(component.choices[2].studentPreviews.length, 1);
    assert.strictEqual(component.choices[2].nonStudentPreviews.length, 0);
  });

  test('it displays non-student theme images for non-learners', async function (assert) {
    class PreferencesMock extends Service {
      theme = 'system';
    }

    class CurrentUserMock extends Service {
      performsNonLearnerFunction = true;
    }

    this.owner.register('service:preferences', PreferencesMock);
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><ThemeChooser /></template>);

    assert.strictEqual(component.choices[0].studentPreviews.length, 0);
    assert.strictEqual(component.choices[0].nonStudentPreviews.length, 2);
    assert.strictEqual(component.choices[1].studentPreviews.length, 0);
    assert.strictEqual(component.choices[1].nonStudentPreviews.length, 1);
    assert.strictEqual(component.choices[2].studentPreviews.length, 0);
    assert.strictEqual(component.choices[2].nonStudentPreviews.length, 1);
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
  });
});
