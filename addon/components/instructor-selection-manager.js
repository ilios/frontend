/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from "ember-intl";
import layout from '../templates/components/instructor-selection-manager';

export default Component.extend({
  layout,
  intl: service(),
  instructors: null,
  availableInstructorGroups: null,
  classNames: ['instructor-selection-manager'],
  tagName: 'section',
  instructorGroups: null,
  userSearchPlaceholder: t('general.findInstructorOrGroup'),
  'data-test-instructor-selection-manager': true,

  actions: {
    addInstructor(user){
      this.addInstructor(user);
    },
    addInstructorGroup(group){
      this.addInstructorGroup(group);
    },
    removeInstructor(user){
      this.removeInstructor(user);
    },
    removeInstructorGroup(group){
      this.removeInstructorGroup(group);
    },
  }
});
