import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { defaultValidator } from 'ember-a11y-refocus';

export default class IliosHeaderComponent extends Component {
  @service currentUser;
  @service session;
  @service router;
  @service iliosConfig;
  @service pageTitle;

  @use searchEnabled = new ResolveAsyncValue(() => [this.iliosConfig.getSearchEnabled()]);

  get showSearch() {
    return (
      this.searchEnabled &&
      this.session.isAuthenticated &&
      this.router.currentRouteName !== 'search' &&
      this.currentUser.performsNonLearnerFunction
    );
  }

  @action
  search(q) {
    this.router.transitionTo('search', {
      queryParams: { q },
    });
  }

  checkRouteChange(transition) {
    if (transition.from?.name === transition.to?.name) {
      return false;
    }
    return defaultValidator(transition);
  }
}
