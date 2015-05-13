import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['detail-instructorgroups'],
  subject: null,
  isIlmSession: false,
  isManaging: false,
  initialGroups: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('subject.instructorGroups').then(function(instructorGroups){
        self.set('initialGroups', instructorGroups.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      var self = this;
      //we get a proxy here so we use the content
      let subject = this.get('subject.content');
      subject.get('instructorGroups').then(function(newInstructorGroups){
        let oldInstructorGroups = self.get('initialGroups').filter(function(instructorGroup){
          return !newInstructorGroups.contains(instructorGroup);
        });
        oldInstructorGroups.forEach(function(instructorGroup){
          if(self.get('isIlmSession')){
            instructorGroup.get('ilmSessions').removeObject(subject);
          }
          instructorGroup.save();
        });

        subject.save().then(function(){
          newInstructorGroups.save().then(function(){
            self.set('isManaging', false);
            self.set('initialGroups', []);
          });
        });
      });
    },
    cancel: function(){
      var instructorGroups = this.get('subject').get('instructorGroups');
      instructorGroups.clear();
      instructorGroups.addObjects(this.get('initialGroups'));
      this.set('isManaging', false);
    }
  }
});
