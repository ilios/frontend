import Component from '@ember/component';
import { inject as service } from '@ember/service';
import scrollTo from 'ilios-common/utils/scroll-to';
import layout from '../templates/components/publish-menu';

export default Component.extend({
  router: service(),

  layout,

  classNameBindings: ['publicationStatus', ':publish-menu'],
  publicationStatus: 'notpublished',
  icon: 'cloud',
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
      this.router.transitionTo(this.reviewRoute, this.reviewObject);
      scrollTo('.course-publicationcheck');
    },

    scrollToSessionPublication() {
      const reviewRoute = this.reviewRoute;
      const parentObjectId = this.parentObject.id;
      const reviewObject = this.reviewObject;
      this.router.transitionTo(reviewRoute, parentObjectId, reviewObject);
      scrollTo('.session-publicationcheck-content');
    }
  }
});
