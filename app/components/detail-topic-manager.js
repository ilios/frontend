import Ember from 'ember';
import DS from 'ember-data';

import { translationMacro as t } from "ember-i18n";

const {computed, inject, RSVP} = Ember;
const {service} = inject;
const {PromiseArray} = DS;
const {sort} = computed;

export default Ember.Component.extend({
  i18n: service(),
  tagName: 'section',
  classNames: ['detail-block'],
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  selectedTopics: [],
  sortBy: ['title'],
  sortedTopics: sort('selectedTopics', 'sortBy'),
  availableTopics: [],
  filteredAvailableTopics: computed('availableTopics.[]', 'selectedTopics.[]', 'filter', function(){
    let defer = RSVP.defer();
    let exp = new RegExp(this.get('filter'), 'gi');
    
    this.get('availableTopics').then(availableTopics => {
      let filteredTopics = availableTopics.filter(topic => {
        return (
          topic.get('title') !== undefined &&
          this.get('selectedTopics') &&
          topic.get('title').match(exp) &&
          !this.get('selectedTopics').contains(topic)
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
      this.sendAction('add', topic);
    },
    remove: function(topic){
      this.sendAction('remove', topic);
    }
  }
});
