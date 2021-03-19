/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'computed-property.volatile' },
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'ember-string.htmlsafe-ishtmlsafe' },
  ],
};
