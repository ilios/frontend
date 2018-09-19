import Mixin from '@ember/object/mixin';

export default Mixin.create({
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('showErrorsFor', []);
  },
  showErrorsFor: [],
  actions: {
    addErrorDisplayFor(field){
      this.showErrorsFor.pushObject(field);
    },
    addErrorDisplaysFor(fields){
      this.showErrorsFor.pushObjects(fields);
    },
    removeErrorDisplayFor(field){
      this.showErrorsFor.removeObject(field);
    },
    clearErrorDisplay(){
      this.set('showErrorsFor', []);
    },
  }
});
