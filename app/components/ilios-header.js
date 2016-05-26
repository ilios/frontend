import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { service } = inject;

export default Component.extend({
  session: service(),
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
  classNames: ['ilios-header'],
  tagName: 'header',
  locales: computed('i18n.locales', 'i18n.locale', function() {
    return this.get('i18n.locales').map(locale => {
      return { id: locale, text: this.get('i18n').t('language.select.' + locale) };
    }).filter(locale => locale.id !== this.get('i18n.locale'));
  }),
  actions: {
    changeLocale(newLocale){
      this.get('i18n').set('locale', newLocale);
    }
  }
});
