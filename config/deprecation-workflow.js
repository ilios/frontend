window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    //this is thrown by ember simple auth which wont be fixed until 1.0
    { handler: "silence", matchMessage: "`lookup` was called on a Registry. The `initializer` API no longer receives a container, and you should use an `instanceInitializer` to look up objects from the container." },
    { handler: "silence", matchMessage: "Using store.find(type) has been deprecated. Use store.findAll(type) to retrieve all records for a given type." },
    { handler: "silence", matchMessage:  /You modified [a-z\(\)\.\s]+ twice in a single render/i},
    { handler: "silence", matchMessage: "The default behavior of `shouldBackgroundReloadRecord` will change in Ember Data 2.0 to always return true. If you would like to preserve the current behavior please override `shouldBackgroundReloadRecord` in your adapter:application and return false." },
    { handler: "silence", matchMessage: /The default behavior of shouldReloadAll will change in Ember Data 2.0 to always return false when there is at least one ["a-z\-]+ record in the store. If you would like to preserve the current behavior please override shouldReloadAll in your adapter:application and return true./ },
    { handler: "silence", matchMessage: /A property (.*) was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation./ },
    { handler: "silence", matchMessage: "Your custom serializer uses the old version of the Serializer API, with `extract` hooks. Please upgrade your serializers to the new Serializer API using `normalizeResponse` hooks instead." },
    { handler: "silence", matchMessage: "this.append() is deprecated. Please use this.render() or this.$() instead." },
    { handler: "silence", matchMessage: "Using the same function as getter and setter is deprecated." },
    { handler: "silence", matchMessage: "You tried to look up 'store:main', but this has been deprecated in favor of 'service:store'." },
    { handler: "silence", matchMessage: "Ember.keys is deprecated in favor of Object.keys" },
    { handler: "silence", matchMessage: "Controller#needs is deprecated, please use Ember.inject.controller() instead" },
    { handler: "silence", matchMessage: "Using Ember.HTMLBars._registerHelper is deprecated. Helpers (even dashless ones) are automatically resolved."},
    { handler: "silence", matchMessage: "Using `Ember.HTMLBars.makeBoundHelper` is deprecated. Please refactor to using `Ember.Helper` or `Ember.Helper.helper`."},
    { handler: "silence", matchMessage: /Depending on arrays using a dependent key/},
  ]
};
