/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/publish-menu';

export default Component.extend({
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
});
