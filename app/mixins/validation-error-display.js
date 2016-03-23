import Ember from 'ember';

const { Mixin } = Ember;

export default Mixin.create({
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('showErrorsFor', []);
  },
  showErrorsFor: [],
  actions: {
    addErrorDisplayFor(field){
      this.get('showErrorsFor').pushObject(field);
    },
    addErrorDisplaysFor(fields){
      this.get('showErrorsFor').pushObjects(fields);
    },
    removeErrorDisplayFor(field){
      this.get('showErrorsFor').removeObject(field);
    },
    clearErrorDisplay(){
      this.set('showErrorsFor', []);
    },
  }
});
