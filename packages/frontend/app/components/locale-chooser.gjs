import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { findById, uniqueValues } from 'ilios-common/utils/array-helpers';

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
}
