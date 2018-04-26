/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Component.extend({
  currentUser: service(),
  classNameBindings: [':offering-manager', 'showRemoveConfirmation'],
  offering: null,
  editable: true,

  isEditing: false,
  showRemoveConfirmation: false,
  'data-test-offering-manager': true,

  userCanDelete: computed('editable', 'offering.session.course', 'offering.allInstructors.[]', 'currentUser.model.directedCourses.[]', async function(){
    const offering = this.get('offering');
    if (isEmpty(offering)) {
      return false;
    }
    if (!enforceRelationshipCapabilityPermissions) {
      const currentUser = this.get('currentUser');
      const isDeveloper = await currentUser.get('userIsDeveloper');
      if (isDeveloper) {
        return true;
      }
      const user = await currentUser.get('model');
      const allInstructors = await offering.get('allInstructors');
      if(allInstructors.includes(user)){
        return true;
      }
      const session = await offering.get('session');
      const course = await session.get('course');
      const directedCourses = await course.get('directedCourses');
      return directedCourses.includes(course);
    }

    return this.get('editable');
  }),

  actions: {
    save(startDate, endDate, room, learnerGroups, instructorGroups, instructors){
      const offering = this.get('offering');
      offering.setProperties({startDate, endDate, room, learnerGroups, instructorGroups, instructors});

      return offering.save();
    },
    remove() {
      this.sendAction('remove', this.get('offering'));
    },
    cancelRemove() {
      this.set('showRemoveConfirmation', false);
    },
    confirmRemove() {
      this.set('showRemoveConfirmation', true);
    },
  }
});
