import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default class ChooseMaterialTypeComponent extends Component {
  @tracked isOpen = false;

  focusFirstLink = task(async () => {
    await timeout(1);
    document.querySelector('.choose-material-type .menu button:first-of-type').focus();
  });

  handleArrowUp(item) {
    if (item?.previousElementSibling) {
      item.previousElementSibling.focus();
    } else {
      item?.parentElement.lastElementChild.focus();
    }
  }

  async handleArrowDown(item) {
    if (item.classList.value.includes('toggle')) {
      this.isOpen = true;
      await this.focusFirstLink.perform();
    } else {
      if (item.nextElementSibling) {
        item.nextElementSibling.focus();
      } else {
        await this.focusFirstLink.perform();
      }
    }
  }

  @action
  async toggleMenu() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      await this.focusFirstLink.perform();
    }
  }
  @action
  keyUp({ key, target }) {
    switch (key) {
      case 'ArrowDown':
        this.handleArrowDown(target);
        break;
      case 'ArrowUp':
        this.handleArrowUp(target);
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.close();
        break;
    }
  }
  @action
  clearFocus() {
    const buttons = document.querySelectorAll('.choose-material-type .menu button');
    buttons.forEach((el) => el.blur());
  }
  @action
  close() {
    this.isOpen = false;
  }
}
