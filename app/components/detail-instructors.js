import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  classNames: ['detail-instructors'],
  ilmSession: null,
  isManaging: false,
  instructorGroupBuffer: [],
  instructorBuffer: [],
  titleCount: Ember.computed('ilmSession.instructorGroups.length', 'ilmSession.instructors.length', function(){
    return this.get('ilmSession.instructorGroups.length') +
           this.get('ilmSession.instructors.length');
  }),
  actions: {
    manage: function(){
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
    save: function(){
      var promises = [];
      var ilmSession = this.get('ilmSession.content');
      let instructorGroups = ilmSession.get('instructorGroups');
      let removableInstructorGroups = instructorGroups.filter(group => !this.get('instructorGroupBuffer').contains(group));

      instructorGroups.clear();
      removableInstructorGroups.forEach(group => {
        promises.pushObject(group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
          return group.save();
        }));

        promises.pushObject(group.save());
      });
      this.get('instructorGroupBuffer').forEach(function(group){
        promises.pushObject(group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);
          return group.save().then(newGroup => {
            instructorGroups.pushObject(newGroup);
          });
        }));
      });

      let removableInstructors = instructorGroups.filter(user => !this.get('instructorBuffer').contains(user));
      let instructors = ilmSession.get('instructors');

      instructors.clear();
      removableInstructors.forEach(user => {
        promises.pushObject(user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
          return user.save();
        }));

        promises.pushObject(user.save());
      });
      this.get('instructorBuffer').forEach(function(user){
        promises.pushObject(user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);
          return user.save().then(newUser => {
            instructors.pushObject(newUser);
          });
        }));
      });

      promises.pushObject(ilmSession.save());
      Ember.RSVP.all(promises).then( () => {
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
