import Component from '@glimmer/component';
import { schedule } from '@ember/runloop';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class UserMenuComponent extends Component {
  @service intl;
  @service currentUser;
  @tracked isOpen = false;
  @tracked element;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get model() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @action
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  @action
  keyUp(evt) {
    const button = evt.target.tagName.toLowerCase() === 'button' ? evt.target : null;
    let item;
    if (!button) {
      item = evt.target.tagName.toLowerCase() === 'li' ? evt.target : evt.target.parentElement;
    }

    switch (evt.key) {
      case 'ArrowDown':
        this.handleArrowDown(evt, item);
        break;
      case 'ArrowUp':
        this.handleArrowUp(item);
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }

    return true;
  }

  handleArrowDown(evt, item) {
    if (evt.target.tagName.toLowerCase() === 'button') {
      this.isOpen = true;
    } else {
      if (item.nextElementSibling) {
        item.nextElementSibling.querySelector('a').focus();
      } else {
        schedule('afterRender', () => {
          this.element.querySelector('.menu li:nth-of-type(1) a').focus();
        });
      }
    }
  }

  handleArrowUp(item) {
    if (item.previousElementSibling) {
      item.previousElementSibling.querySelector('a').focus();
    } else {
      this.element.querySelector('.menu li:last-of-type a').focus();
    }
  }

  focus(el) {
    el.focus();
  }
}
