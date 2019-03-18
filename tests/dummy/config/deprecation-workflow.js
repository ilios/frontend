/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "ember-component.send-action"},
    { handler: "silence", matchId: "events.inherited-function-listeners"},
    { handler: "silence", matchId: "ember-polyfills.deprecate-merge"},
  ]
};
