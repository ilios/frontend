/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "computed-property.override"}, //ember-modal
    { handler: "silence", matchId: "ember-runtime.deprecate-copy-copyable"},
    { handler: "silence", matchId: "computed-property.volatile"},
    { handler: "silence", matchId: "common.async-computed"},
    { handler: "silence", matchId: "ember-cli-page-object.old-finders"},
    { handler: "silence", matchId: "ember-cli-page-object.is-property"},
  ]
};
