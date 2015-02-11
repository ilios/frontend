import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['status'],
  item: null,
  isPublished: Ember.computed.alias('item.isPublished'),
  isScheduled: Ember.computed.alias('item.publishedAsTbd'),
  showIcon: true
});
