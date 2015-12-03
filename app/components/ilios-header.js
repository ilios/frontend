import Ember from 'ember';

const { Component, computed } = Ember;
const { oneWay, equal } = computed;

export default Component.extend({
  session: null,
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
  userName: oneWay('currentUser.model.fullName'),
  inEnglish: equal('i18n.locale', 'en'),
  inSpanish: equal('i18n.locale', 'es'),
  inFrench: equal('i18n.locale', 'fr'),
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
