import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { findById, uniqueValues } from 'ilios-common/utils/array-helpers';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import { on } from '@ember/modifier';
import toggle from 'ilios-common/helpers/toggle';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { fn } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import focus from 'ilios-common/modifiers/focus';
import { faGlobe, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class LocaleChooserComponent extends Component {
  @service intl;
  @tracked isOpen = false;
  @service localStorage;

  get locale() {
    const locale = this.intl.get('primaryLocale');
    return findById(this.locales, locale);
  }

  get locales() {
    return uniqueValues(this.intl.get('locales')).map((locale) => {
      return { id: locale, text: this.getLocaleLabel(locale) };
    });
  }

  get uniqueId() {
    return guidFor(this);
  }

  get currentLocaleLabel() {
    return this.getLocaleLabel(this.locale.id);
  }

  @action
  close() {
    this.isOpen = false;
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

  @action
  changeLocale(id, event) {
    this.isOpen = false;
    this.intl.setLocale(id);
    this.localStorage.set('locale', id);
    window.document.querySelector('html').setAttribute('lang', id);
    window.document
      .querySelector('meta[name="description"]')
      .setAttribute('content', this.intl.t('general.metaDescription'));
    event.target.parentElement.parentElement.firstElementChild.focus();
  }

  @action
  moveFocus(event) {
    const { key, target } = event;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (target.nextElementSibling) {
          target.nextElementSibling.focus();
        } else {
          target.parentElement.firstElementChild.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (target.previousElementSibling) {
          target.previousElementSibling.focus();
        } else {
          target.parentElement.lastElementChild.focus();
        }
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }
  }
  @action
  clearFocus(event) {
    const buttons = event.target.parentElement.children;
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].blur();
    }
  }
  @action
  toggleMenu({ key }) {
    switch (key) {
      case 'ArrowDown':
        this.isOpen = true;
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }
  }
  <template>
    <div class="locale-chooser header-menu" data-test-locale-chooser {{onClickOutside this.close}}>
      <button
        type="button"
        class="toggle"
        aria-haspopup="true"
        aria-expanded={{if this.isOpen "true" "false"}}
        aria-labelledby="{{this.uniqueId}}-locale-chooser-title"
        data-level="toggle"
        data-test-toggle
        {{on "click" (toggle "isOpen" this)}}
        {{on "keyup" this.toggleMenu}}
      >
        <FaIcon @icon={{faGlobe}} />
        <span id="{{this.uniqueId}}-locale-chooser-title">
          {{this.currentLocaleLabel}}
        </span>
        <FaIcon @icon={{if this.isOpen faCaretDown faCaretRight}} @fixedWidth={{true}} />
      </button>
      {{#if this.isOpen}}
        <div class="menu" role="menu">
          {{#each this.locales as |loc index|}}
            <button
              class="header-menu-item"
              type="button"
              role="menuitemradio"
              lang={{loc.id}}
              tabindex="-1"
              aria-checked={{if (eq this.locale.id loc.id) "true" "false"}}
              data-level="item"
              data-test-item
              {{on "click" (fn this.changeLocale loc.id)}}
              {{on "keyup" this.moveFocus}}
              {{on "mouseenter" this.clearFocus}}
              {{focus (eq index 0)}}
            >
              {{loc.text}}
            </button>
          {{/each}}
        </div>
      {{/if}}
    </div>
  </template>
}
