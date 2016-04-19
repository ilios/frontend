import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  learnerGroup: null,
  classNames: ['detail-view-main-title'],

  actions: {
    changeTitle(newTitle) {
      const learnerGroup = this.get('learnerGroup');

      learnerGroup.set('title', newTitle);
      learnerGroup.save();
    }
  }
});
