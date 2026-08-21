import Component from '@glimmer/component';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import { task } from 'ember-concurrency';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { ensureSafeComponent } from '@embroider/util';
import { isTesting } from '@embroider/macros';

import ThemeImageStudent from './theme-image-student';
import ThemeImageNonStudent from './theme-image-non-student';
import ThemeImageNonStudentMobile from './theme-image-non-student-mobile';

export default class UserProfileThemeChooserComponent extends Component {
  @service preferences;
  @service currentUser;

  get previewComponent() {
    if (this.currentUser.performsNonLearnerFunction) {
      return ensureSafeComponent(ThemeImageNonStudent, this);
    }

    return ensureSafeComponent(ThemeImageStudent, this);
  }

  get mobilePreviewComponent() {
    if (this.currentUser.performsNonLearnerFunction) {
      return ensureSafeComponent(ThemeImageNonStudentMobile, this);
    }

    return ensureSafeComponent(ThemeImageStudent, this);
  }

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
        {{t "general.theme"}}
      </h2>
      <p>
        {{t "general.themePickerExplanation"}}
      </p>
      <ul class="chooser" data-test-chooser>
        <li class={{if (eq this.preferences.theme "system") "active"}} data-test-system>
          <label class="system">
            <this.previewComponent @colorScheme="light" />
            <this.previewComponent @colorScheme="dark" />
            <this.mobilePreviewComponent @colorScheme="light" />
            <this.mobilePreviewComponent @colorScheme="dark" />
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
            <this.previewComponent @colorScheme="light" />
            <this.mobilePreviewComponent @colorScheme="light" />
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
            <this.previewComponent @colorScheme="dark" />
            <this.mobilePreviewComponent @colorScheme="dark" />
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
