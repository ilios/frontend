import Ember from 'ember';

export default Ember.ObjectController.extend({
  isEditing: false,
  durationOptions: [1,2,3,4,5,6,7,8,9,10],
  actions: {
    edit: function(){
      this.set('isEditing', true);
    },
    save: function() {
      this.set('isEditing', false);
      var program = this.get('model');
      program.set('title', this.get('title'));
      program.set('shortTitle', this.get('shortTitle'));
      program.set('duration', this.get('duration'));
      program.set('publishedAsTbd', this.get('publishedAsTbd'));
      program.save();
    },
  }
});
