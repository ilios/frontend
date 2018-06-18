/* eslint ember/order-in-controllers: 0 */
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
const { alias } = computed;
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

export default Controller.extend({
  currentUser: service(),
  session: service(),
  i18n: service(),
  headData: service(),

  titleTokenKeys: null,

  currentlyLoading: false,
  apiVersion,

  init() {
    this._super(...arguments);

    const showErrorDisplay = false;
    const errors = [];

    this.setProperties({ showErrorDisplay, errors });
  },

  title: alias('headData.title'),
  titleTokens: alias('headData.titleTokens'),

  translatedTitle: computed('i18n.locale', 'title', 'titleTokens.[]', function(){
    const title = this.get('title');
    const tokens = this.get('titleTokens');
    const i18n = this.get('i18n');
    if (isPresent(title)) {
      return title;
    }

    if (isPresent(tokens)) {
      let translatedTokens = tokens.map(key => i18n.t(key));
      return translatedTokens.join(' ');
    }

    return '';

  }),

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
