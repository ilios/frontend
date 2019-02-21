
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from "ember-intl";
import layout from '../templates/components/instructor-selection-manager';

export default Component.extend({
  intl: service(),
  layout,
  instructors: null,
  availableInstructorGroups: null,
  classNames: ['instructor-selection-manager'],
  tagName: 'section',
  instructorGroups: null,
  'data-test-instructor-selection-manager': true,

  userSearchPlaceholder: t('general.findInstructorOrGroup'),
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
