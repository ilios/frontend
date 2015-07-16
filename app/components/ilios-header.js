import Ember from 'ember';

export default Ember.Component.extend({
  session: null,
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
  userName: Ember.computed.oneWay('currentUser.model.fullName'),
  inEnglish: Ember.computed.equal('i18n.locale', 'en'),
  inSpanish: Ember.computed.equal('i18n.locale', 'es'),
  inFrench: Ember.computed.equal('i18n.locale', 'fr'),
  locales: Ember.computed('i18n.locales', 'i18n.locale', function() {
    return this.get('i18n.locales').map(locale => {
      return { id: locale, text: this.get('i18n').t('language.select.' + locale) };
    }).filter(locale => locale.id !== this.get('i18n.locale'));
  }),
  actions: {
    logout(){
      this.get('session').invalidate();
    },
    changeLocale(newLocale){
      this.get('i18n').set('locale', newLocale);
    }
  }
});
