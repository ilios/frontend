import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    removeSequenceBlock(block) {
      let report = this.get('model');
      block.destroyRecord().then(() => {
        report.reload();
      });
    },
  }
});
