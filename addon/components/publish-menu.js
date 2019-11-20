import Component from '@ember/component';
import { inject as service } from '@ember/service';
import scrollTo from 'ilios-common/utils/scroll-to';
import { schedule } from '@ember/runloop';

export default Component.extend({
  router: service(),

  classNameBindings: ['publicationStatus', ':publish-menu', 'isOpen'],
  ariaRole: 'menubar',
  publicationStatus: 'notpublished',
  isOpen: false,
  title: null,
  showAsIs: false,
  showPublish: false,
  showReview: false,
  showTbd: false,
  showUnPublish: false,
  reviewRoute: null,
  reviewObject: null,
  parentObject: null,
  publishTranslation: '',
  unpublishTranslation: '',

  actions: {
    scrollToCoursePublication() {
      this.set('isOpen', false);
      this.router.transitionTo(this.reviewRoute, this.reviewObject);
      scrollTo('.course-publicationcheck');
    },

    scrollToSessionPublication() {
      this.set('isOpen', false);
      const reviewRoute = this.reviewRoute;
      const parentObjectId = this.parentObject.id;
      const reviewObject = this.reviewObject;
      this.router.transitionTo(reviewRoute, parentObjectId, reviewObject);
      scrollTo('.session-publicationcheck-content');
    },
    publish() {
      this.set('isOpen', false);
      this.publish();
    },
    unpublish() {
      this.set('isOpen', false);
      this.unpublish();
    },
    publishAsTbd() {
      this.set('isOpen', false);
      this.publishAsTbd();
    },
  },

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
          this.element.querySelector('.menu button:nth-of-type(1)').focus();
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
