/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/publication-status';

const { alias } = computed;

export default Component.extend({
  layout,
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
    const isPublished = this.get('isPublished');
    const isScheduled = this.get('isScheduled');
    const publishedLangKey = this.get('publishedLangKey');
    const scheduledLangKey = this.get('scheduledLangKey');
    const notPublishedLangKey = this.get('notPublishedLangKey');
    if (isScheduled) {
      return scheduledLangKey;
    }
    if (isPublished) {
      return publishedLangKey;
    }

    return notPublishedLangKey;
  }),
  iconKey: computed('isPublished', 'isScheduled', function(){
    const isPublished = this.get('isPublished');
    const isScheduled = this.get('isScheduled');
    if (isScheduled) {
      return 'clock';
    }
    if (isPublished) {
      return 'star';
    }

    return 'star-half-alt';
  }),
  publicationStatus: computed('isPublished', 'isScheduled', function(){
    const isPublished = this.get('isPublished');
    const isScheduled = this.get('isScheduled');
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
