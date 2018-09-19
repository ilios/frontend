/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP, { all } from 'rsvp';
const { Promise } = RSVP;

export default Component.extend({
  currentUser: service(),
  init() {
    this._super(...arguments);
    this.set('instructorGroupBuffer', []);
    this.set('instructorBuffer', []);
  },
  tagName: 'section',
  classNames: ['detail-instructors'],
  ilmSession: null,
  isManaging: false,
  instructorGroupBuffer: null,
  instructorBuffer: null,
  'data-test-detail-instructors': true,

  titleCount: computed('ilmSession.instructorGroups.length', 'ilmSession.instructors.length', function(){
    return this.get('ilmSession.instructorGroups.length') +
           this.get('ilmSession.instructors.length');
  }),

  availableInstructorGroups: computed('currentUser.model', function() {
    return new Promise(resolve => {
      this.get('currentUser.model').then(model => {
        model.get('school').then(school => {
          school.get('instructorGroups').then(instructorGroups => {
            resolve(instructorGroups);
          });
        });
      });
    });
  }),

  actions: {
    manage() {
      let promises = [];
      promises.pushObject(this.get('ilmSession.instructorGroups').then(instructorGroups => {
        this.set('instructorGroupBuffer', instructorGroups.toArray());
      }));

      promises.pushObject(this.get('ilmSession.instructors').then(instructors => {
        this.set('instructorBuffer', instructors.toArray());
      }));

      all(promises).then(()=>{
        this.set('isManaging', true);
      });
    },
    save() {
      var ilmSession = this.get('ilmSession.content');

      let instructorGroups = ilmSession.get('instructorGroups');
      let removableInstructorGroups = instructorGroups.filter(group => !this.instructorGroupBuffer.includes(group));
      instructorGroups.clear();
      removableInstructorGroups.forEach(group => {
        group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
        });
      });
      this.instructorGroupBuffer.forEach(function(group){
        instructorGroups.pushObject(group);
        group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);

        });
      });

      let instructors = ilmSession.get('instructors');
      let removableInstructors = instructors.filter(user => !this.instructorBuffer.includes(user));
      instructors.clear();
      removableInstructors.forEach(user => {
        user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
        });
      });
      this.instructorBuffer.forEach(function(user){
        instructors.pushObject(user);
        user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);

        });
      });

      ilmSession.save().then(() => {
        this.set('isManaging', false);
      });

    },
    cancel(){
      this.set('instructorGroupBuffer', []);
      this.set('instructorBuffer', []);
      this.set('isManaging', false);
    },
    addInstructorGroupToBuffer(instructorGroup){
      this.instructorGroupBuffer.pushObject(instructorGroup);
    },
    addInstructorToBuffer(instructor){
      this.instructorBuffer.pushObject(instructor);
    },
    removeInstructorGroupFromBuffer(instructorGroup){
      this.instructorGroupBuffer.removeObject(instructorGroup);
    },
    removeInstructorFromBuffer(instructor){
      this.instructorBuffer.removeObject(instructor);
    },
  }
});
