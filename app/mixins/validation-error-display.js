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
    removeErrorDisplayFor(field){
      this.get('showErrorsFor').removeObject(field);
    },
    clearErrorDisplay(){
      this.set('showErrorsFor', []);
    },
  }
});
