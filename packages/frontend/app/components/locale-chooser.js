import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { findById, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LocaleChooserComponent extends Component {
  @service intl;
  @tracked isOpen = false;
  @tracked menuElement;
  @tracked menuButtonElement;

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
  focusOnFirstItem(menuElement) {
    this.menuElement = menuElement;
    menuElement.querySelector('button:first-of-type').focus();
  }

  @action
  setMenuButton(menuButtonElement) {
    this.menuButtonElement = menuButtonElement;
  }

  @action
  close() {
    this.isOpen = false;
  }

  @action
  changeLocale(id) {
    this.isOpen = false;
    this.intl.setLocale(id);
    window.document.querySelector('html').setAttribute('lang', id);
    this.menuButtonElement.focus();
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
          this.menuElement.querySelector('button:nth-of-type(1)').focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (target.previousElementSibling) {
          target.previousElementSibling.focus();
        } else {
          this.menuElement.querySelector('button:last-of-type').focus();
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
  clearFocus() {
    const buttons = this.menuElement.querySelectorAll('button');
    buttons.forEach((el) => el.blur());
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
