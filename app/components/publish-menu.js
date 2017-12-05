/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
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
});
