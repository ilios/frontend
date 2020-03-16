import Component from '@ember/component';

export default Component.extend({
  tagName: "",
  multiModeSupported: false,
  fillModeSupported: false,
  singleMode: true,

  actions: {
    generateNewLearnerGroups(num){
      this.generateNewLearnerGroups(num);
    }
  }
});
