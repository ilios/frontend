import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortAscending: true,
  sortProperties: ['title'],
  isAddingNew: false,
  newTitle: null,
  newShortTitle: null,
  newDuration: null,
  durationOptions: [1,2,3,4,5,6,7,8,9,10],
  actions: {
    addNew: function(){
      this.set('isAddingNew', true);
      this.set('newTitle', 'New Title');
      this.set('newShortTitle', 'New Short Title');
      this.set('newDuration', 1);
    },
    createProgram: function() {
      var self = this;
      this.store.find('school', this.get('currentSchool')).then(function(school){
        var program = self.store.createRecord('program', {
          title: self.get('newTitle'),
          shortTitle: self.get('newShortTitle'),
          duration: self.get('newDuration'),
          publishedAsTbd: false,
          owningSchool: school
        });
        program.save().then(function(){
          self.set('isAddingNew', false);
          self.set('newTitle', null);
          self.set('newShortTitle', null);
          self.set('newDuration', null);

          self.store.find('program', {owningSchool: self.get('currentSchool')})
          .then(function(programs){
            self.set('model', programs);
          });

        });
      });
    }
  }
});
