/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "ember-component.send-action"},
    { handler: "silence", matchId: "events.inherited-function-listeners"},
    { handler: "silence", matchId: "ember-polyfills.deprecate-merge"},
    { handler: "silence", matchId: "ember-views.curly-components.jquery-element"},
    { handler: "silence", matchId: "computed-property.override"}, //ember-modal
    { handler: "silence", matchId: "ember-runtime.deprecate-copy-copyable"},
    { handler: "silence", matchId: "computed-property.volatile"},
    { handler: "silence", matchId: "ember-component.is-visible"},
  ]
};
