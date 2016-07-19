import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    removeChildSequenceBlock(block) {
      return block.destroyRecord();
    },
  }
});
