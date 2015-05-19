import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  subject: null,
  instructors: [],
  availableInstructorGroups: [],
  sortInstructorsBy: ['title'],
  sortedInstructors: Ember.computed.sort('instructors', 'sortInstructorsBy'),
  instructorGroups: [],
  sortGroupsBy: ['title'],
  sortedInstructorGroups: Ember.computed.sort('instructorGroups', 'sortGroupsBy'),
  userSearchPlaceholderTranslation: 'general.findInstructorOrGroup',
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
