window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchMessage: "`lookup` was called on a Registry. The `initializer` API no longer receives a container, and you should use an `instanceInitializer` to look up objects from the container." },

    // These are all from Addons
    { handler: "silence", matchMessage: "Ember.keys is deprecated in favor of Object.keys" },
    { handler: "silence", matchMessage: "Using `Ember.HTMLBars.makeBoundHelper` is deprecated. Please refactor to using `Ember.Helper` or `Ember.Helper.helper`." },
    { handler: "silence", matchMessage: "A property of <ilios@view:-outlet::ember198324> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },
    { handler: "silence", matchMessage: "A property of <ilios@view:-outlet::ember207775> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },
    { handler: "silence", matchMessage: "A property of <ilios@view:-outlet::ember208544> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },
    { handler: "silence", matchMessage: "A property of <ilios@view:-outlet::ember252037> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },
    { handler: "silence", matchMessage: "A property of <ilios@view:-outlet::ember252507> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },
    { handler: "silence", matchMessage: "A property of <ilios@view:-outlet::ember253110> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },
    { handler: "silence", matchMessage: "A property of <ilios@component:-test-holder::ember265558> was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation." },

    // Going with 2.0's default behavior
    { handler: "silence", matchMessage: "The default behavior of `shouldBackgroundReloadRecord` will change in Ember Data 2.0 to always return true. If you would like to preserve the current behavior please override `shouldBackgroundReloadRecord` in your adapter:application and return false." },

    // Staying with RESTAdapter
    { handler: "silence", matchMessage: "You are currently using the default DS.RESTAdapter adapter. For Ember 2.0 the default adapter will be DS.JSONAPIAdapter. If you would like to continue using DS.RESTAdapter please create an application adapter that extends DS.RESTAdapter." }
  ]
};
