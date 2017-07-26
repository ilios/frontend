import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    lockProgramYear: function(programYear){
      programYear.set('locked', true);
      return programYear.save();
    },
    unlockProgramYear: function(programYear){
      programYear.set('locked', false);
      return programYear.save();
    },
  }
});
