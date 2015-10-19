import Ember from 'ember';
import DS from 'ember-data';

import { translationMacro as t } from "ember-i18n";

const {computed, inject, RSVP} = Ember;
const {alias} = computed;
const {service} = inject;
const {PromiseArray} = DS;

export default Ember.Component.extend({
  i18n: service(),
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  subject: null,
  topics: alias('subject.topics'),
  sortedTopics: computed('topics.[]', function(){
    let defer = RSVP.defer();

    this.get('topics').then(topics => {
      defer.resolve(topics.sortBy('title'));
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  availableTopics: [],
  tagName: 'section',
  classNames: ['detail-block'],
  filteredAvailableTopics: computed('availableTopics.[]', 'topics.[]', 'filter', function(){
    let defer = RSVP.defer();
    let exp = new RegExp(this.get('filter'), 'gi');
    
    this.get('availableTopics').then(availableTopics => {
      let filteredTopics = availableTopics.filter(topic => {
        return (
          topic.get('title') !== undefined &&
          this.get('topics') &&
          topic.get('title').match(exp) &&
          !this.get('topics').contains(topic)
        );
      });
      
      defer.resolve(filteredTopics.sortBy('title'));
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });

  }),
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
