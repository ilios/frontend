/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-cli-page-object.old-collection-api' },
    { handler: 'silence', matchId: 'ember-metal.run.sync' },
    { handler: 'silence', matchId: 'ember-routing.route-router' },
    { handler: 'silence', matchId: 'ember-runtime.deprecate-copy-copyable' },
    { handler: 'silence', matchId: 'ember-polyfills.deprecate-merge' },
    { handler: 'silence', matchId: 'deprecate-router-events' }, // requires https://github.com/ember-a11y/ember-a11y/issues/73
    { handler: 'silence', matchId: 'remove-handler-infos' },
    { handler: 'silence', matchId: 'ember-name-key-usage' }, //waiting for https://github.com/offirgolan/ember-cp-validations/issues/620
    { handler: 'silence', matchId: 'computed-property.volatile' },
    { handler: 'silence', matchId: 'common.async-computed' },
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'ember-test-helpers.trigger-event.options-blob-array' },
    { handler: 'silence', matchId: 'ember-string.htmlsafe-ishtmlsafe' },
    { handler: 'silence', matchId: 'implicit-injections' }, //https://github.com/simplabs/ember-simple-auth/issues/2302
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }, //https://github.com/emberjs/ember-render-modifiers/issues/32
    { handler: 'silence', matchId: 'this-property-fallback' },
  ],
};
