import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  intl: service(),
  moment: service(),
  beforeModel() {
    this.intl.setLocale('en-us');
    this.moment.setLocale('en');
  }
});
