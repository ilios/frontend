import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    lockProgramYear(programYear) {
      programYear.set('locked', true);
      return programYear.save();
    },
    unlockProgramYear(programYear) {
      programYear.set('locked', false);
      return programYear.save();
    },
  }
});
