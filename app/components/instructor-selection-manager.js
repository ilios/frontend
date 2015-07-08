import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  instructors: [],
  availableInstructorGroups: [],
  sortInstructorsBy: ['title'],
  sortedInstructors: Ember.computed.sort('instructors', 'sortInstructorsBy'),
  instructorGroups: [],
  sortGroupsBy: ['title'],
  sortedInstructorGroups: Ember.computed.sort('instructorGroups', 'sortGroupsBy'),
  userSearchPlaceholder: t('general.findInstructorOrGroup'),
  actions: {
    addInstructor(user){
      this.sendAction('addInstructor', user);
    },
    addInstructorGroup(group){
      this.sendAction('addInstructorGroup', group);
    },
    removeInstructor(user){
      this.sendAction('removeInstructor', user);
    },
    removeInstructorGroup(group){
      this.sendAction('removeInstructorGroup', group);
    },
  }
});
