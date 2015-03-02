import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'general.filterPlaceholder',
  filter: '',
  sortBy: ['title'],
  subject: null,
  isSaving: false,
  topics: Ember.computed.alias('subject.disciplines'),
  sortedTopics: Ember.computed.sort('topics', 'sortBy'),
  availableTopics: [],
  tagName: 'section',
  classNames: ['detail-block'],
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
    add: function(topic){
      var self = this;
      this.set('isSaving', true);
      var subject = this.get('subject');
      subject.get('disciplines').addObject(topic);
      subject.save().then(function(){
        self.set('isSaving', false);
      });
    },
    remove: function(topic){
      var self = this;
      this.set('isSaving', true);
      var subject = this.get('subject');
      subject.get('disciplines').removeObject(topic);
      subject.save().then(function(){
        self.set('isSaving', false);
      });
    }
  }
});
