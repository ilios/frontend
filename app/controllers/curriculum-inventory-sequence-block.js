import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: [
    'sortSessionsBy',
  ],
  sortSessionsBy: 'title',
  canUpdate: false,
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
