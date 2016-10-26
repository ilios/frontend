import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  learnerGroup: null,
  tagName: 'header',
  classNames: ['learnergroup-header'],

  actions: {
    changeTitle(newTitle) {
      const learnerGroup = this.get('learnerGroup');

      learnerGroup.set('title', newTitle);
      learnerGroup.save();
    }
  }
});
