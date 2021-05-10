/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'computed-property.volatile' },
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'ember-string.htmlsafe-ishtmlsafe' },
    { handler: 'silence', matchId: 'implicit-injections' }, //https://github.com/simplabs/ember-simple-auth/issues/2302
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }, //https://github.com/emberjs/ember-render-modifiers/issues/32
    { handler: 'silence', matchId: 'this-property-fallback' }, //Lots of these in ember-file-upload we have linting to ensure we don't add any ourselves
  ],
};
