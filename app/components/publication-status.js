import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNameBindings: [
    ':status',
    'isPublished:published',
    'isScheduled:scheduled',
    'isNotPublished:notpublished'
  ],
  item: null,
  isPublished: Ember.computed.alias('item.isPublished'),
  isScheduled: Ember.computed.alias('item.publishedAsTbd'),
  isSomething: Ember.computed.or('isPublished', 'isScheduled'),
  isNotPublished: Ember.computed.not('isSomething'),
  showIcon: true
});
