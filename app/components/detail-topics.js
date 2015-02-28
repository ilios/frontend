import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'general.filterPlaceholder',
  filter: '',
  sortBy: ['title'],
  topics: [],
  sortedTopics: Ember.computed.sort('topics', 'sortBy'),
  availableTopics: [],
  filteredAvailableTopics: function(){
    var self = this;
    var filter = this.get('filter');
    var exp = new RegExp(filter, 'gi');

    var topics = this.get('availableTopics').filter(function(topic) {
      return (
        topic.get('title') !== undefined &&
        self.get('topics') &&
        topic.get('title').match(exp) &&
        !self.get('topics').contains(topic)
      );
    });

    return topics.sortBy('title');
  }.property('topics.@each', 'filter', 'availableTopics.@each'),
  actions: {
    filter: function(filterTerm){
      this.set('filter', filterTerm);
    },
    add: function(topic){
      this.sendAction('addTopic', topic);
    },
    remove: function(topic){
      this.sendAction('removeTopic', topic);
    }
  }
});
