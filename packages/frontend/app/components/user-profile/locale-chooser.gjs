import Component from '@glimmer/component';
import { service } from '@ember/service';
import { findById, uniqueValues } from 'ilios-common/utils/array-helpers';
import { isTesting } from '@embroider/macros';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { task } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';

export default class LocaleChooserComponent extends Component {
  @service intl;
  @service preferences;

  get locale() {
    return findById(this.locales, this.intl.primaryLocale);
  }

  get locales() {
    return uniqueValues(this.intl.locales).map((locale) => {
      return { id: locale, text: this.getLocaleLabel(locale) };
    });
  }

  get currentLocaleLabel() {
    return this.getLocaleLabel(this.locale.id);
  }

  getLocaleLabel(locale) {
    switch (locale) {
      case 'en-us':
        return this.intl.t('general.language.en-us');
      case 'es':
        return this.intl.t('general.language.es');
      case 'fr':
        return this.intl.t('general.language.fr');
      default:
        return locale;
    }
  }

  changeLocale = task({ restartable: true }, async (locale) => {
    if (this.preferences.locale !== locale) {
      this.intl.setLocale(locale);
      await this.preferences.setLocale(locale);
      if (!isTesting()) {
        window.document.querySelector('html').setAttribute('lang', locale);
        window.document
          .querySelector('meta[name="description"]')
          .setAttribute('content', this.intl.t('general.metaDescription'));
      }
    }
  });

  <template>
    <div class="locale-chooser small-component" data-test-locale-chooser>
      <h2 class="title" data-test-title>
        {{t "general.languages"}}
      </h2>
      <p>
        {{t "general.languagePickerExplanation"}}
      </p>
      <ul class="chooser" data-test-chooser>
        {{#each this.locales as |loc|}}
          <li class={{if (eq this.preferences.locale loc.id) "active"}} data-test-item>
            <label>
              <input
                type="radio"
                name="locale"
                checked={{eq this.preferences.locale loc.id}}
                {{on "click" (fn this.changeLocale.perform loc.id)}}
              />
              <span>{{loc.text}}</span>
            </label>
          </li>
        {{/each}}
      </ul>
    </div>
  </template>
}
