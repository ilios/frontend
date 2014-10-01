import Ember from 'ember';

export default Ember.Controller.extend({
  title: null,
  shortTitle: null,
  duration: 1,
  durationOptions: [1,2,3,4,5,6,7,8,9,10],
  currentSchool: null,
  actions: {
    save: function() {
      var self = this;
      this.store.find('school', this.get('currentSchool').get('id')).then(function(school){
        var program = self.store.createRecord('program', {
          title: self.get('title'),
          shortTitle: self.get('shortTitle'),
          duration: self.get('duration'),
          publishedAsTbd: false,
          owningSchool: school
        });
        program.save().then(function(){
          self.set('title', null);
          self.set('shortTitle', null);
          self.set('duration', 1);
          self.transitionToRoute('programs');
        });
      });
    }
  }
});
