import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  session: service(),

  apiVersion,
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
