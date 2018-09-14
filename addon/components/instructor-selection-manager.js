/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from "ember-i18n";
import layout from '../templates/components/instructor-selection-manager';

export default Component.extend({
  layout,
  i18n: service(),
  instructors: null,
  availableInstructorGroups: null,
  classNames: ['instructor-selection-manager'],
  tagName: 'section',
  instructorGroups: null,
  userSearchPlaceholder: t('general.findInstructorOrGroup'),
  'data-test-instructor-selection-manager': true,

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
