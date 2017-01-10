import Ember from 'ember';

const { Component } = Ember;

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
  secondReviewObject: null,
  publishTranslation: '',
  unpublishTranslation: '',
});
