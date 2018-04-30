/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "ember-cli-page-object.old-collection-api"},
    { handler: "silence", matchId: "ember-metal.run.sync"},
    { handler: "silence", matchId: "ember-simple-auth.session.authorize"},
    { handler: "silence", matchId: "ember-routing.route-router"},
    { handler: "silence", matchId: "ember-inflector.globals"}, //waiting on https://github.com/emberjs/ember-inflector/issues/146
  ]
};
