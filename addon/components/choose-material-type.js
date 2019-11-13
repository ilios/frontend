import Component from '@ember/component';
import layout from '../templates/components/choose-material-type';
import { schedule } from '@ember/runloop';

export default Component.extend({
  layout,
  classNameBindings: [':choose-material-type', 'isOpen'],
  isOpen: false,
  ariaRole: 'menubar',
  'data-test-choose-material-type': true,
  openMenuAndSelectTheCurrentFirstOption() {
    this.set('isOpen', true);
    schedule('afterRender', () => {
      this.element.querySelector(`.menu button:first-of-type`).focus();
    });
  },

  keyDown({ originalEvent }) {
    switch (originalEvent.key) {
    case 'ArrowDown':
      if (originalEvent.target.dataset.level === 'toggle') {
        this.openMenuAndSelectTheCurrentFirstOption();
      } else {
        if (originalEvent.target.nextElementSibling) {
          originalEvent.target.nextElementSibling.focus();
        } else {
          schedule('afterRender', () => {
            this.element.querySelector('.menu button:nth-of-type(1)').focus();
          });
        }
      }
      break;
    case 'ArrowUp':
      if (originalEvent.target.previousElementSibling) {
        originalEvent.target.previousElementSibling.focus();
      } else {
        this.element.querySelector('.menu button:last-of-type').focus();
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
  }
});
