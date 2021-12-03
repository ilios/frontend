/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }, //https://github.com/emberjs/ember-render-modifiers/issues/32
    { handler: 'silence', matchId: 'this-property-fallback' }, //https://github.com/sethwebster/ember-cli-new-version/pull/91
    { handler: 'silence', matchId: 'ember-lifeline-deprecated-addeventlistener' },
    { handler: 'silence', matchId: 'ember-test-helpers.setup-rendering-context.render' },
    { handler: 'silence', matchId: 'routing.transition-methods' },
    { handler: 'silence', matchId: 'ember-cli-page-object.is-property' },
    { handler: 'silence', matchId: 'common.user-performs-non-learner-function' },
    { handler: 'silence', matchId: 'common.curriculum-inventory-report-is-finalized' },
    { handler: 'silence', matchId: 'common.async-computed' },
    { handler: 'silence', matchId: 'common.school-cohorts' },
  ],
};
