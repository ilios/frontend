import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    removeSequenceBlock(block) {
      const report = this.model;
      block.destroyRecord().then(() => {
        report.reload();
      });
    },
  }
});
