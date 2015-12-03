import Ember from 'ember';

const { Component, computed } = Ember;
const { alias } = computed;

export default Component.extend({
  showIcon: true,
  tagName: 'span',
  classNameBindings: [
    ':status',
    'publicationStatus'
  ],
  publicationStatus: computed('isPublished', 'isScheduled', function(){
    if(this.get('isScheduled')){
      return 'scheduled';
    } else if (this.get('isPublished')){
      return 'published';
    }

    return 'notpublished';
  }),
  item: null,
  isPublished: alias('item.isPublished'),
  isScheduled: alias('item.publishedAsTbd')
});
