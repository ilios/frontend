import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

const { Component, computed } = Ember;
const { alias, sort } = computed;

export default Component.extend({
  i18n: Ember.inject.service(),
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  sortBy: ['title'],
  subject: null,
  availableInstructorGroups: [],
  instructorGroups: alias('subject.instructorGroups'),
  sortedInstructorGroups: sort('instructorGroups', 'sortBy'),
  filteredAvailableInstructorGroups: computed(
    'instructorGroups.[]',
    'filter',
    'availableInstructorGroups.@each.title',
    function(){
      var self = this;
      var filter = this.get('filter');
      var exp = new RegExp(filter, 'gi');
      var instructorGroups = this.get('availableInstructorGroups')?this.get('availableInstructorGroups'):[];
      return instructorGroups.filter(function(group) {
        return (
          group.get('title') !== undefined &&
          self.get('instructorGroups') &&
          exp.test(group.get('title')) &&
          !self.get('instructorGroups').contains(group)
        );
      }).sortBy('title');
    }
  ),
  actions: {
    add: function(instructorGroup){
      var subject = this.get('subject');
      subject.get('instructorGroups').addObject(instructorGroup);
    },
    remove: function(instructorGroup){
      var subject = this.get('subject');
      subject.get('instructorGroups').removeObject(instructorGroup);
    }
  }
});
