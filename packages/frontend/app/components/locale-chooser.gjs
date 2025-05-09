import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { findById, uniqueValues } from 'ilios-common/utils/array-helpers';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import { on } from '@ember/modifier';
import toggle from 'ilios-common/helpers/toggle';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { concat, fn } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import focus from 'ilios-common/modifiers/focus';

export default class LocaleChooserComponent extends Component {
  @service intl;
  @tracked isOpen = false;

  get locale() {
    const locale = this.intl.get('primaryLocale');
    return findById(this.locales, locale);
  }

  get locales() {
    return uniqueValues(this.intl.get('locales')).map((locale) => {
      return { id: locale, text: this.intl.t('general.language.' + locale) };
    });
  }

  get uniqueId() {
    return guidFor(this);
  }

  @action
  close() {
    this.isOpen = false;
  }

  @action
  changeLocale(id, event) {
    this.isOpen = false;
    this.intl.setLocale(id);
    window.document.querySelector('html').setAttribute('lang', id);
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
    <div class="locale-chooser" data-test-locale-chooser {{onClickOutside this.close}}>
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
        <FaIcon @icon="globe" />
        <span id="{{this.uniqueId}}-locale-chooser-title">
          {{t (concat "general.language." this.locale.id)}}
        </span>
        <FaIcon @icon={{if this.isOpen "caret-down" "caret-right"}} />
      </button>
      {{#if this.isOpen}}
        <div class="menu" role="menu">
          {{#each this.locales as |loc index|}}
            <button
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
