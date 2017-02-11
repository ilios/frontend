import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  sortableObjectList: null,
  learningMaterials: null,
  didReceiveAttrs() {
    this.set('sortableObjectList', this.get('learningMaterials').toArray().sort((lm1, lm2) => {
      let pos1 = lm1.get('position');
      let pos2 = lm2.get('position');
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      let id1 = lm1.get('id');
      let id2 = lm2.get('id');
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
    }));
  },
  actions: {
    sortEndAction(){

    }
  }
});
