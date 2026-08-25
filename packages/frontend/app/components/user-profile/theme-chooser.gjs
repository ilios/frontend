import Component from '@glimmer/component';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import { task } from 'ember-concurrency';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { isTesting } from '@embroider/macros';

import ThemeImages from './theme-images';

export default class UserProfileThemeChooserComponent extends Component {
  @service preferences;
  @service currentUser;

  changeTheme = task({ restartable: true }, async (theme) => {
    if (this.preferences.theme !== theme) {
      if (!isTesting()) {
        window.document.documentElement.dataset.theme = theme;
      }
      await this.preferences.setTheme(theme);
    }
  });

  <template>
    <div
      class="user-profile-theme-chooser large-component"
      data-test-user-profile-theme-chooser
      ...attributes
    >
      <h2 class="title" data-test-title>
        {{t "general.themes"}}
      </h2>
      <p>
        {{t "general.themePickerExplanation"}}
      </p>
      <ul class="chooser" data-test-chooser>
        <li class={{if (eq this.preferences.theme "system") "active"}} data-test-system>
          <label class="system">
            <ThemeImages
              @performsNonLearnerFunction={{this.currentUser.performsNonLearnerFunction}}
              @mode="system"
            />
            <input
              type="radio"
              name="theme"
              checked={{eq this.preferences.theme "system"}}
              {{on "click" (fn this.changeTheme.perform "system")}}
            />
            <span>{{t "general.system"}}</span>
          </label>
        </li>
        <li class={{if (eq this.preferences.theme "light") "active"}} data-test-light>
          <label>
            <ThemeImages
              @performsNonLearnerFunction={{this.currentUser.performsNonLearnerFunction}}
              @mode="light"
            />
            <input
              type="radio"
              name="theme"
              checked={{eq this.preferences.theme "light"}}
              {{on "click" (fn this.changeTheme.perform "light")}}
            />
            <span>{{t "general.light"}}</span>
          </label>
        </li>
        <li class={{if (eq this.preferences.theme "dark") "active"}} data-test-dark>
          <label>
            <ThemeImages
              @performsNonLearnerFunction={{this.currentUser.performsNonLearnerFunction}}
              @mode="dark"
            />
            <input
              type="radio"
              name="theme"
              checked={{eq this.preferences.theme "dark"}}
              {{on "click" (fn this.changeTheme.perform "dark")}}
            />
            <span>{{t "general.dark"}}</span>
          </label>
        </li>
      </ul>
    </div>
  </template>
}
