import Ember from 'ember';

export default Ember.ObjectController.extend({
  durationOptions: [1,2,3,4,5,6,7,8,9,10],
  actions: {
    save: function() {
      var program = this.get('model');
      program.set('title', this.get('title'));
      program.set('shortTitle', this.get('shortTitle'));
      program.set('duration', this.get('duration'));
      program.set('publishedAsTbd', this.get('publishedAsTbd'));
      program.save();
      this.transitionToRoute('program', program);
    },
  }
});
