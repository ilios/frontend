window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "ember-application.app-instance-container"},
    { handler: "silence", matchId: "ember-htmlbars.ember-handlebars-safestring"},
    { handler: "silence", matchId: "ember-getowner-polyfill.import"},
    { handler: "silence", matchId: "ember-metal.ember-k"},
  ]
};
