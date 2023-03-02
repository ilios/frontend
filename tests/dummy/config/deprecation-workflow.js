/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'common.async-computed' },
    { handler: 'silence', matchId: 'common.resolve-computed' },
    { handler: 'silence', matchId: 'common.competency-is-domain' },
    { handler: 'silence', matchId: 'common.competency-is-not-domain' },
    { handler: 'silence', matchId: 'common.school-cohorts' },
    { handler: 'silence', matchId: 'common.curriculum-inventory-report-is-finalized' },
    { handler: 'silence', matchId: 'ember-modifier.function-based-options' },
    { handler: 'silence', matchId: 'ember-data:deprecate-promise-proxies' }, //https://github.com/emberjs/data/issues/7997
    { handler: 'silence', matchId: 'ember-data:deprecate-non-strict-relationships' },
    { handler: 'silence', matchId: 'ember-data:deprecate-early-static' },
    { handler: 'silence', matchId: 'ember-data:deprecate-array-like' },
    { handler: 'silence', matchId: 'ember-data:deprecate-promise-many-array-behaviors' },
    { handler: 'silence', matchId: 'ember-data:no-a-with-array-like' },
    { handler: 'silence', matchId: 'ember-string.add-package' },
  ],
};
