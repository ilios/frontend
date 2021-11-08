/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }, //https://github.com/emberjs/ember-render-modifiers/issues/32
    { handler: 'silence', matchId: 'this-property-fallback' },
    { handler: 'silence', matchId: 'ember-lifeline-deprecated-addeventlistener' },
    { handler: 'silence', matchId: 'ember-test-helpers.setup-rendering-context.render' },
    { handler: 'silence', matchId: 'routing.transition-methods' },
    { handler: 'silence', matchId: 'ember-cli-page-object.is-property' },
  ],
};
