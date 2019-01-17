/* eslint ember/order-in-controllers: 0 */
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

export default Controller.extend({
  currentUser: service(),
  session: service(),
  intl: service(),
  currentlyLoading: false,
  apiVersion,

  init() {
    this._super(...arguments);

    const showErrorDisplay = false;
    const errors = [];

    this.setProperties({ showErrorDisplay, errors });
  },

  showErrorDisplay: null,
  errors: null,

  addError(error) {
    this.get('errors').pushObject(error);
    this.set('showErrorDisplay', true);
  },

  actions: {
    clearErrors(){
      this.set('errors', []);
      this.set('showErrorDisplay', false);
    }
  }
});
