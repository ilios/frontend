import Ember from 'ember';

export default Ember.Component.extend({
  topics: [],
  sortBy: ['title'],
  sortedTopics: Ember.computed.sort('topics', 'sortBy'),
});
