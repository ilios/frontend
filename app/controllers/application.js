import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  apiVersion: service(),
  currentUser: service(),
  intl: service(),
  session: service(),

  currentlyLoading: false,
  errors: null,
  showErrorDisplay: null,

  init() {
    this._super(...arguments);
    const showErrorDisplay = false;
    const errors = [];
    this.setProperties({ showErrorDisplay, errors });
  },

  actions: {
    clearErrors() {
      this.set('errors', []);
      this.set('showErrorDisplay', false);
    }
  },

  addError(error) {
    this.errors.pushObject(error);
    this.set('showErrorDisplay', true);
  }
});
