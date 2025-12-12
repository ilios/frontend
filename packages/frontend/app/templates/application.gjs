import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import ConnectionStatus from 'frontend/components/connection-status';
import ApiVersionNotice from 'ilios-common/components/api-version-notice';
import UpdateNotification from 'frontend/components/update-notification';
import IliosHeader from 'frontend/components/ilios-header';
import { LinkTo } from '@ember/routing';
import IliosNavigation from 'frontend/components/ilios-navigation';
import ErrorDisplay from 'frontend/components/error-display';
import FlashMessages from 'frontend/components/flash-messages';
<template>
  {{pageTitle (t "general.ilios") separator=" " front=true}}
  <ConnectionStatus />
  <ApiVersionNotice />
  <UpdateNotification />
  <div
    class="application-wrapper{{if
        @controller.currentUser.performsNonLearnerFunction
        ' show-navigation'
      }}"
  >
    <IliosHeader />
    <div class="ilios-logo">
      <LinkTo @route="dashboard" title={{t "general.dashboard"}}>
        <picture>
          <source
            srcset="/assets/images/ilios-logo.svg"
            media="(min-width: 400px)"
            alt={{t "general.logo"}}
          />
          <img src="/assets/images/sunburst.svg" alt={{t "general.logo"}} />
        </picture>

      </LinkTo>
    </div>
    {{#if @controller.session.isAuthenticated}}
      <IliosNavigation />
    {{/if}}
    <main id="main">
      {{#if @controller.showErrorDisplay}}
        <ErrorDisplay @errors={{@controller.errors}} @clearErrors={{@controller.clearErrors}} />
      {{else}}
        {{outlet}}
      {{/if}}
    </main>
    <footer class="ilios-footer">
      <div class="version font-size-smallest">
        {{@controller.iliosVersionTag}}
        {{@controller.apiVersionTag}}
        {{@controller.frontendVersionTag}}
      </div>
    </footer>
  </div>
  <FlashMessages />
</template>
