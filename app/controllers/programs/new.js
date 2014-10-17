import Ember from 'ember';

export default Ember.Controller.extend({
  title: null,
  shortTitle: null,
  duration: 1,
  durationOptions: [1,2,3,4,5,6,7,8,9,10],
  currentSchool: Ember.computed.alias('currentUser.currentSchool'),
  actions: {
    save: function() {
      var self = this;
      var program = this.store.createRecord('program', {
        title: this.get('title'),
        shortTitle: this.get('shortTitle'),
        duration: this.get('duration'),
        publishedAsTbd: false,
        owningSchool: this.get('currentUser.currentSchool')
      });
      program.save().then(function(newProgram){
        self.get('currentUser.currentSchool').get('programs').then(function(programs){
          programs.pushObject(newProgram);
        });
        self.set('title', null);
        self.set('shortTitle', null);
        self.set('duration', 1);
        self.transitionToRoute('programs');
      });
    }
  }
});
