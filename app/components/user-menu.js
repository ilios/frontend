import Component from '@ember/component';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default Component.extend({
  i18n: service(),
  currentUser: service(),
  tagName: 'nav',
  classNameBindings: [':user-menu', 'isOpen'],
  isOpen: false,
  'data-test-user-menu': true,
  actions: {
    toggleMenu() {
      const isOpen = this.get('isOpen');
      if (isOpen) {
        this.set('isOpen', false);
      } else {
        this.openMenuAndSelectTheFirstItem();
      }
    },
  },
  openMenuAndSelectTheFirstItem() {
    this.set('isOpen', true);
    schedule('afterRender', () => {
      this.element.querySelector('.menu li:nth-of-type(1) a').focus();
    });
  },
  keyDown({ originalEvent }) {
    let button = originalEvent.target.tagName.toLowerCase() === 'button' ? originalEvent.target : null;
    let item;
    if (!button) {
      item = originalEvent.target.tagName.toLowerCase() === 'li' ? originalEvent.target : originalEvent.target.parentElement;
    }

    switch (originalEvent.key) {
    case 'ArrowDown':
      if (originalEvent.target.tagName.toLowerCase() === 'button') {
        this.openMenuAndSelectTheFirstItem();
      } else {
        if (item.nextElementSibling) {
          item.nextElementSibling.querySelector('a').focus();
        } else {
          schedule('afterRender', () => {
            this.element.querySelector('.menu li:nth-of-type(1) a').focus();
          });
        }
      }
      break;
    case 'ArrowUp':
      if (item.previousElementSibling) {
        item.previousElementSibling.querySelector('a').focus();
      } else {
        this.element.querySelector('.menu li:last-of-type a').focus();
      }
      break;
    case 'Escape':
    case 'Tab':
    case 'ArrowRight':
    case 'ArrowLeft':
      this.set('isOpen', false);
      break;
    }

    return true;
  },
});
