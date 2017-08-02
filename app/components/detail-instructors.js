import Ember from 'ember';

const { Component, computed, RSVP } = Ember;
const { Promise } = RSVP;

export default Component.extend({
  currentUser: Ember.inject.service(),
  tagName: 'section',
  classNames: ['detail-instructors'],
  ilmSession: null,
  isManaging: false,
  instructorGroupBuffer: [],
  instructorBuffer: [],

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

      Ember.RSVP.all(promises).then(()=>{
        this.set('isManaging', true);
      });
    },
    save() {
      var ilmSession = this.get('ilmSession.content');

      let instructorGroups = ilmSession.get('instructorGroups');
      let removableInstructorGroups = instructorGroups.filter(group => !this.get('instructorGroupBuffer').includes(group));
      instructorGroups.clear();
      removableInstructorGroups.forEach(group => {
        group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
        });
      });
      this.get('instructorGroupBuffer').forEach(function(group){
        instructorGroups.pushObject(group);
        group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);

        });
      });

      let instructors = ilmSession.get('instructors');
      let removableInstructors = instructors.filter(user => !this.get('instructorBuffer').includes(user));
      instructors.clear();
      removableInstructors.forEach(user => {
        user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
        });
      });
      this.get('instructorBuffer').forEach(function(user){
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
      this.get('instructorGroupBuffer').pushObject(instructorGroup);
    },
    addInstructorToBuffer(instructor){
      this.get('instructorBuffer').pushObject(instructor);
    },
    removeInstructorGroupFromBuffer(instructorGroup){
      this.get('instructorGroupBuffer').removeObject(instructorGroup);
    },
    removeInstructorFromBuffer(instructor){
      this.get('instructorBuffer').removeObject(instructor);
    },
  }
});
