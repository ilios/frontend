import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    removeSequenceBlock(block) {
      let report = this.get('model');
      block.destroyRecord().then(() => {
        report.reload();
      });
    },
  }
});
