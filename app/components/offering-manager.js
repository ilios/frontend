/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  currentUser: service(),
  classNameBindings: [':offering-manager', 'showRemoveConfirmation'],
  offering: null,
  editable: true,

  isEditing: false,
  showRemoveConfirmation: false,
  'data-test-offering-manager': true,

  userCanDelete: computed('editable', 'offering.session.course', 'offering.allInstructors.[]', 'currentUser.model.directedCourses.[]', async function(){
    const offering = this.offering;
    if (isEmpty(offering)) {
      return false;
    }
    return this.editable;
  }),

  actions: {
    save(startDate, endDate, room, learnerGroups, instructorGroups, instructors){
      const offering = this.offering;
      offering.setProperties({startDate, endDate, room, learnerGroups, instructorGroups, instructors});

      return offering.save();
    },
    remove() {
      this.sendAction('remove', this.offering);
    },
    cancelRemove() {
      this.set('showRemoveConfirmation', false);
    },
    confirmRemove() {
      this.set('showRemoveConfirmation', true);
    },
  }
});
