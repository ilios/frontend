import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { defaultValidator } from 'ember-a11y-refocus';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import inViewport from 'ember-in-viewport/modifiers/in-viewport';
import NavigationNarrator from 'ember-a11y-refocus/components/navigation-narrator';
import t from 'ember-intl/helpers/t';
import GlobalSearchBox from 'frontend/components/global-search-box';
import LocaleChooser from 'frontend/components/locale-chooser';
import UserMenu from 'frontend/components/user-menu';
import UserGuideLink from 'frontend/components/user-guide-link';
import FaIcon from 'ilios-common/components/fa-icon';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

export default class IliosHeaderComponent extends Component {
  @service currentUser;
  @service session;
  @service router;
  @service iliosConfig;
  @service pageTitle;

  @tracked displayBackToTop = false;

  searchConfig = new TrackedAsyncData(this.iliosConfig.getSearchEnabled());

  @cached
  get searchEnabled() {
    return this.searchConfig.isResolved ? this.searchConfig.value : false;
  }

  @cached
  get userModelData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  @cached
  get primarySchoolData() {
    return new TrackedAsyncData(this.userModel?.school);
  }

  get userModel() {
    return this.userModelData.isResolved ? this.userModelData.value : null;
  }

  get primarySchool() {
    return this.primarySchoolData.isResolved ? this.primarySchoolData.value : null;
  }

  get showSearch() {
    return (
      this.searchEnabled &&
      this.session.isAuthenticated &&
      this.router.currentRouteName !== 'search' &&
      this.currentUser.performsNonLearnerFunction &&
      this.userModelData.isResolved &&
      this.primarySchoolData.isResolved
    );
  }

  get backToTopClasses() {
    return this.displayBackToTop ? 'back-to-top' : 'back-to-top hidden';
  }

  @action
  toggleBackToTop(visibility) {
    this.displayBackToTop = visibility;
  }

  @action
  backToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  search = (q) => {
    this.router.transitionTo('search', {
      queryParams: {
        q,
        schools: this.primarySchool.id,
        years: `${currentAcademicYear()}-${currentAcademicYear() - 1}`,
      },
    });
  };

  checkRouteChange(transition) {
    if (transition.from?.name === transition.to?.name) {
      return false;
    }
    return defaultValidator(transition);
  }
  <template>
    <header
      class="ilios-header"
      data-test-ilios-header
      {{inViewport
        onExit=(fn this.toggleBackToTop true)
        onEnter=(fn this.toggleBackToTop false)
        viewportSpy=true
      }}
      ...attributes
    >
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
    <button
      type="button"
      class={{this.backToTopClasses}}
      aria-label={{t "general.backToTop"}}
      hidden
      {{on "click" this.backToTop}}
    >
      <FaIcon @icon="chevron-up" aria-hidden="true" />
      <span>{{t "general.backToTop"}}</span>
    </button>
  </template>
}
