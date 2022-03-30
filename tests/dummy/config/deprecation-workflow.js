/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }, //https://github.com/emberjs/ember-render-modifiers/issues/32
    { handler: 'silence', matchId: 'ember-global' },
    { handler: 'silence', matchId: 'common.async-computed' },
    { handler: 'silence', matchId: 'common.competency-is-domain' },
    { handler: 'silence', matchId: 'common.competency-is-not-domain' },
    { handler: 'silence', matchId: 'common.school-cohorts' },
    { handler: 'silence', matchId: 'common.user-performs-non-learner-function' },
    { handler: 'silence', matchId: 'common.curriculum-inventory-report-is-finalized' },
    { handler: 'silence', matchId: 'ember-modifier.use-destroyables' }, //https://github.com/zeppelin/ember-click-outside
  ],
};
