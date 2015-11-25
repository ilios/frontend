window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    //this is thrown by ember simple auth which wont be fixed until 1.0
    { handler: "silence", matchMessage: "`lookup` was called on a Registry. The `initializer` API no longer receives a container, and you should use an `instanceInitializer` to look up objects from the container." },
    { handler: "silence", matchMessage: /A property (.*) was modified inside the didInsertElement hook. You should never change properties on components, services or models during didInsertElement because it causes significant performance degradation./ },
    { handler: "silence", matchMessage: "this.append() is deprecated. Please use this.render() or this.$() instead." },
    { handler: "silence", matchMessage: "Using the same function as getter and setter is deprecated." },
    { handler: "silence", matchMessage: "Ember.keys is deprecated in favor of Object.keys" },
    { handler: "silence", matchMessage: "Controller#needs is deprecated, please use Ember.inject.controller() instead" },
    { handler: "silence", matchMessage: "Using Ember.HTMLBars._registerHelper is deprecated. Helpers (even dashless ones) are automatically resolved."},
    { handler: "silence", matchMessage: "Using `Ember.HTMLBars.makeBoundHelper` is deprecated. Please refactor to using `Ember.Helper` or `Ember.Helper.helper`."},
    { handler: "silence", matchMessage: /Depending on arrays using a dependent key/},
    { handler: "silence", matchId: "ember-uploader.files-attr"},
  ]
};
