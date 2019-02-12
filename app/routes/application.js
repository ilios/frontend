import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin,{
  intl: service(),
  moment: service(),

  beforeModel() {
    const intl = this.intl;
    const moment = this.moment;
    const locale = intl.get('locale');
    moment.setLocale(locale);
    window.document.querySelector('html').setAttribute('lang', locale);
  },
});
