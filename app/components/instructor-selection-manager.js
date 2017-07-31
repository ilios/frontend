import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { translationMacro as t } from "ember-i18n";

const { sort } = computed;

export default Component.extend({
  i18n: service(),
  instructors: [],
  availableInstructorGroups: null,
  sortInstructorsBy: ['title'],
  classNames: ['detail-block'],
  tagName: 'section',
  sortedInstructors: sort('instructors', 'sortInstructorsBy'),
  instructorGroups: [],
  sortGroupsBy: ['title'],
  sortedInstructorGroups: sort('instructorGroups', 'sortGroupsBy'),
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
