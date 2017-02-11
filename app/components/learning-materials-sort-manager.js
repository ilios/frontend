import Ember from 'ember';
import SortableByPosition from 'ilios/mixins/sortable-by-position';


const { Component } = Ember;

export default Component.extend(SortableByPosition, {
  sortableObjectList: null,
  learningMaterials: null,
  didReceiveAttrs() {
    this.set('sortableObjectList',
      this.get('learningMaterials').toArray().sort(this.get('learningMaterialSortingCallback')));
  },
  actions: {
    sortEndAction(){

    }
  }
});
