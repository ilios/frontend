import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';
import { loadPolyfills } from 'ilios-common/utils/load-polyfills';

export default Route.extend(ApplicationRouteMixin, {
  intl: service(),
  moment: service(),
  async beforeModel() {
    await loadPolyfills();
    this.intl.setLocale('en-us');
    this.moment.setLocale('en');
  },
});
