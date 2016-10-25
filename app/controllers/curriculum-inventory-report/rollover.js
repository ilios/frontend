import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    loadReport(newReport){
      this.transitionToRoute('curriculumInventoryReport', newReport);
    }
  }
});
