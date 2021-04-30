import Mixin from '@ember/object/mixin';
import { action } from '@ember/object';

export default Mixin.create({
  showErrorsFor: null,

  init() {
    this._super(...arguments);
    this.set('showErrorsFor', []);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('showErrorsFor', []);
  },

  @action
  addErrorDisplayFor(field) {
    this.showErrorsFor.pushObject(field);
  },

  @action
  addErrorDisplaysFor(fields) {
    this.showErrorsFor.pushObjects(fields);
  },

  @action
  removeErrorDisplayFor(field) {
    this.showErrorsFor.removeObject(field);
  },

  @action
  clearErrorDisplay() {
    this.set('showErrorsFor', []);
  },
});
