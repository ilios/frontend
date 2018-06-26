/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  session: service(),
  currentUser: service(),
  i18n: service(),
  moment: service(),
  classNames: ['ilios-header'],
  tagName: 'header',
  ariaRole: 'banner',
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
      window.document.querySelector('html').setAttribute('lang', newLocale);
    }
  }
});
