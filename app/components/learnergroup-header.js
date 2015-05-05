import Ember from 'ember';

export default Ember.Component.extend({
  learnerGroup: null,
  actions: {
    changeTitle: function(newTitle){
      this.get('learnerGroup').set('title', newTitle);
      this.get('learnerGroup').save();
    },
  }
});
