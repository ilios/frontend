import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  sortBy: ['title'],
  subject: null,
  topics: Ember.computed.alias('subject.topics'),
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
      var subject = this.get('subject');
      subject.get('topics').addObject(topic);
    },
    remove: function(topic){
      var subject = this.get('subject');
      subject.get('topics').removeObject(topic);
    }
  }
});
