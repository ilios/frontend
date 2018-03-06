/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from "ember-i18n";

export default Component.extend({
  i18n: service(),
  instructors: null,
  availableInstructorGroups: null,
  classNames: ['instructor-selection-manager'],
  tagName: 'section',
  instructorGroups: null,
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
