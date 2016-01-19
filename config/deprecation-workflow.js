window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    
    // These are all from Addons

    // Caused by ember-validations PR in as https://github.com/dockyard/ember-validations/pull/380
    { handler: "silence", matchMessage: "Ember.keys is deprecated in favor of Object.keys" },
    
    //elemental calendar formatted-date helper
    { handler: "silence", matchMessage: "Using `Ember.HTMLBars.makeBoundHelper` is deprecated. Please refactor to using `Ember.Helper` or `Ember.Helper.helper`." },
    
    { handler: "silence", matchMessage: /A property (.*) was modified inside the didInsertElement hook(.*)/ },
    { handler: "silence", matchMessage: "Usage of Ember.computed.any is deprecated, use `Ember.computed.or` instead." },


    // Going with 2.0's default behavior
    { handler: "silence", matchMessage: "The default behavior of `shouldBackgroundReloadRecord` will change in Ember Data 2.0 to always return true. If you would like to preserve the current behavior please override `shouldBackgroundReloadRecord` in your adapter:application and return false." },

    // Staying with RESTAdapter
    { handler: "silence", matchMessage: "You are currently using the default DS.RESTAdapter adapter. For Ember 2.0 the default adapter will be DS.JSONAPIAdapter. If you would like to continue using DS.RESTAdapter please create an application adapter that extends DS.RESTAdapter." }
  ]
};
