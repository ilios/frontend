import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { defaultValidator } from 'ember-a11y-refocus';

export default class IliosHeaderComponent extends Component {
  @service currentUser;
  @service session;
  @service router;
  @service iliosConfig;
  @service pageTitle;
  searchConfig = new TrackedAsyncData(this.iliosConfig.getSearchEnabled());

  @cached
  get searchEnabled() {
    return this.searchConfig.isResolved ? this.searchConfig.value : false;
  }

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

<header class="ilios-header" data-test-ilios-header ...attributes>
  <NavigationNarrator
    @navigationText={{t "general.navigationCompleteText"}}
    @skipText={{t "general.skipToMainContent"}}
    @routeChangeValidator={{this.checkRouteChange}}
  />
  <h1 data-test-title>
    {{this.pageTitle.title}}
  </h1>
  <div class="tools">
    {{#if this.showSearch}}
      <GlobalSearchBox @search={{this.search}} />
    {{/if}}
    <LocaleChooser />
    {{#if this.session.isAuthenticated}}
      <UserMenu />
    {{/if}}
    <UserGuideLink />
  </div>
</header>