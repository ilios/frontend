/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
const { alias } = computed;

export default Component.extend({
  publishedLangKey: 'general.published',
  scheduledLangKey: 'general.scheduled',
  notPublishedLangKey: 'general.notPublished',

  showIcon: true,
  showText: true,
  tagName: 'span',
  classNameBindings: [
    ':status',
    ':publication-status',
    'publicationStatus'
  ],
  textKey: computed('publishedLangKey', 'scheduledLangKey',  'notPublishedLangKey', 'isPublished', 'isScheduled', function(){
    const isPublished = this.isPublished;
    const isScheduled = this.isScheduled;
    const publishedLangKey = this.publishedLangKey;
    const scheduledLangKey = this.scheduledLangKey;
    const notPublishedLangKey = this.notPublishedLangKey;
    if (isScheduled) {
      return scheduledLangKey;
    }
    if (isPublished) {
      return publishedLangKey;
    }

    return notPublishedLangKey;
  }),
  iconKey: computed('isPublished', 'isScheduled', function(){
    const isPublished = this.isPublished;
    const isScheduled = this.isScheduled;
    if (isScheduled) {
      return 'clock';
    }
    if (isPublished) {
      return 'star';
    }

    return 'star-half-alt';
  }),
  publicationStatus: computed('isPublished', 'isScheduled', function(){
    const isPublished = this.isPublished;
    const isScheduled = this.isScheduled;
    if(isScheduled){
      return 'scheduled';
    } else if (isPublished){
      return 'published';
    }

    return 'notpublished';
  }),
  item: null,
  isPublished: alias('item.isPublished'),
  isScheduled: alias('item.publishedAsTbd')
});
