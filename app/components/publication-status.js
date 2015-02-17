import Ember from 'ember';

export default Ember.Component.extend({
  showIcon: true,
  tagName: 'span',
  classNameBindings: [
    ':status',
    'publicationStatus'
  ],
  publicationStatus: function(){
    if(this.get('isScheduled')){
      return 'scheduled';
    } else if (this.get('isPublished')){
      return 'published';
    }

    return 'notpublished';
  }.property('isPublished', 'isScheduled'),
  item: null,
  isPublished: Ember.computed.alias('item.isPublished'),
  isScheduled: Ember.computed.alias('item.publishedAsTbd'),
});
