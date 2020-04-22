/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "computed-property.override"}, //ember-modal
    { handler: "silence", matchId: "computed-property.volatile"},
    { handler: "silence", matchId: "common.async-computed"},
  ]
};
