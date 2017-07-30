import Ember from 'ember';

const { Controller, computed, isPresent } = Ember;
const { alias } = computed;

export default Controller.extend({
  currentUser: Ember.inject.service(),
  session: Ember.inject.service(),
  i18n: Ember.inject.service(),
  headData: Ember.inject.service(),

  showHeader: true,
  showNavigation: true,
  titleTokenKeys: null,

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
