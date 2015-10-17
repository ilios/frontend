import Ember from 'ember';

const { computed, Controller, inject } = Ember;
const { service } = inject;

export default Controller.extend({
  currentUser: service(),

  i18n: service(),

  pageTitleTranslation: null,

  pageTitle: computed('pageTitleTranslation', 'i18n.locale', {
    get() {
      if(this.get('pageTitleTranslation')){
        return this.get('i18n').t(this.get('pageTitleTranslation'));
      }

      return '';
    }
  }).readOnly(),

  showHeader: true,
  showNavigation: true,

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
  }
});
