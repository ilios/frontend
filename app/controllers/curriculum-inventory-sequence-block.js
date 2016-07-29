import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    removeChildSequenceBlock(block) {
      let parent = this.get('model');
      block.destroyRecord().then(() => {
        parent.reload().then(parent => {
          parent.get('children').then(children => {
            children.invoke('reload');
          });
        });
      });
    },
  }
});
