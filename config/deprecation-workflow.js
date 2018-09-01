/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "ember-cli-page-object.old-collection-api"},
    { handler: "silence", matchId: "ember-metal.run.sync"},
    { handler: "silence", matchId: "ember-routing.route-router"},
    { handler: "silence", matchId: "ember-runtime.deprecate-copy-copyable"},
    { handler: "silence", matchId: "ember-component.send-action"},
    { handler: "silence", matchId: "ember-console.deprecate-logger"},
    { handler: "silence", matchId: "ember-views.event-dispatcher.jquery-event"},
  ]
};
