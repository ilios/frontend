import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadReport(newReport){
      this.transitionToRoute('curriculumInventoryReport', newReport);
    }
  }
});
