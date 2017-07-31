import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
const { Promise } = RSVP;


export default Component.extend({
  currentUser: service(),
  classNames: ['offering-manager'],
  offering: null,
  editable: true,

  isEditing: false,
  showRemoveConfirmation: false,

  userCanDelete: computed('offering.session.course', 'offering.allInstructors.[]', 'currentUser.model.directedCourses.[]', function(){
    const offering = this.get('offering');
    return new Promise(resolve => {
      if (isEmpty(offering)) {
        resolve(false);
      } else {
        this.get('currentUser.userIsDeveloper').then(isDeveloper => {
          if(isDeveloper){
            resolve(true);
          } else {
            this.get('currentUser.model').then(user => {
              offering.get('allInstructors').then(allInstructors => {
                if(allInstructors.includes(user)){
                  resolve(true);
                } else {
                  offering.get('session').then(session => {
                    session.get('course').then(course => {
                      user.get('directedCourses').then(directedCourses => {
                        resolve(directedCourses.includes(course));
                      });
                    });
                  });
                }
              });
            });
          }
        });
      }

    });
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
