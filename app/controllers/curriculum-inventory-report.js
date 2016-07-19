import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    removeSequenceBlock(block) {
      return block.destroyRecord();
    },
  }
});
