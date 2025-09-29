import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

/**
 * Docs: https://github.com/ember-cli/ember-cli-deprecation-workflow
 */
setupDeprecationWorkflow({
  /**
    false by default, but if a developer / team wants to be more aggressive about being proactive with
    handling their deprecations, this should be set to "true"
  */
  throwOnUnhandled: true,
  workflow: [
    /* ... handlers ... */
    /* to generate this list, run your app for a while (or run the test suite),
     * and then run in the browser console:
     *
     *    deprecationWorkflow.flushDeprecations()
     *
     * And copy the handlers here
     */
    /* example: */
    /* { handler: 'silence', matchId: 'template-action' }, */
    { handler: 'silence', matchId: 'importing-inject-from-ember-service' },
    { handler: 'silence', matchId: 'deprecate-import--set-classic-decorator-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-env-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-onerror-from-ember' },
    { handler: 'silence', matchId: 'deprecate-import-default-value-from-ember' },
    { handler: 'silence', matchId: 'ember-data:deprecate-non-strict-types' },
    { handler: 'silence', matchId: 'warp-drive:deprecate-legacy-request-methods' },
  ],
});
