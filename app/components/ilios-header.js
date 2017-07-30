import Ember from 'ember';

const { Component, computed} = Ember;

export default Component.extend({
  session: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
  moment: Ember.inject.service(),
  classNames: ['ilios-header'],
  tagName: 'header',
  title: null,
  locales: computed('i18n.locales', 'i18n.locale', function() {
    return this.get('i18n.locales').uniq().map(locale => {
      return { id: locale, text: this.get('i18n').t('general.language.' + locale) };
    }).filter(locale => locale.id !== this.get('i18n.locale'));
  }),
  actions: {
    changeLocale(newLocale){
      this.get('i18n').set('locale', newLocale);
      this.get('moment').setLocale(newLocale);
    }
  }
});
