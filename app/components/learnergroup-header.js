import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  learnerGroup: null,

  actions: {
    changeTitle(newTitle) {
      const learnerGroup = this.get('learnerGroup');

      learnerGroup.set('title', newTitle);
      learnerGroup.save();
    }
  }
});
