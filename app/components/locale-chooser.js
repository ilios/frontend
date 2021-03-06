import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class LocaleChooserComponent extends Component {
  @service intl;
  @service moment;
  @tracked isOpen = false;
  @tracked menuElement;

  get locale() {
    const locale = this.intl.get('locale');
    return this.locales.findBy('id', locale[0]);
  }

  get locales() {
    return this.intl
      .get('locales')
      .uniq()
      .map((locale) => {
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
  close() {
    this.isOpen = false;
  }

  @action
  changeLocale(id) {
    this.isOpen = false;
    this.intl.setLocale(id);
    this.moment.setLocale(id);
    window.document.querySelector('html').setAttribute('lang', id);
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
