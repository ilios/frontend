/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'throw', matchId: 'common.async-computed' },
    { handler: 'throw', matchId: 'common.resolve-computed' },
    { handler: 'throw', matchId: 'common.competency-is-domain' },
    { handler: 'throw', matchId: 'common.competency-is-not-domain' },
    { handler: 'throw', matchId: 'common.school-cohorts' },
    { handler: 'throw', matchId: 'common.curriculum-inventory-report-is-finalized' },
    { handler: 'silence', matchId: 'ember-data:deprecate-early-static' },
    { handler: 'silence', matchId: 'ember-data:deprecate-array-like' },
    { handler: 'silence', matchId: 'ember-data:deprecate-promise-many-array-behaviors' },
    { handler: 'silence', matchId: 'ember-data:no-a-with-array-like' },
    { handler: 'silence', matchId: 'ember-string.add-package' },
  ],
};
