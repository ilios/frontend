import Ember from 'ember';

export default Ember.Component.extend({
  groups: [],
  sortBy: ['title'],
  sortedGroups: Ember.computed.sort('groups', 'sortBy'),
  actions: {
    edit: function(group){
      this.sendAction('edit', group);
    },
    remove: function(group){
      this.sendAction('remove', group);
    },
  }
});
