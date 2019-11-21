import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ChooseMaterialTypeComponent extends Component {
  @tracked isOpen = false;

  focusOnFirstItem(menuElement) {
    menuElement.querySelector('button:first-of-type').focus();
  }

  @action
  moveFocus({ key, target }) {
    switch (key) {
    case 'ArrowDown':
      if (target.nextElementSibling) {
        target.nextElementSibling.focus();
      } else {
        this.menuElement.querySelector('button:nth-of-type(1)').focus();
      }
      break;
    case 'ArrowUp':
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
    buttons.forEach(el => el.blur());
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
