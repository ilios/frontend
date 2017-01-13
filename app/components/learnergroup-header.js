import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  learnerGroup: null,
  tagName: 'header',
  classNames: ['learnergroup-header'],
  didReceiveAttrs(){
    this._super(...arguments);
    const learnerGroup = this.get('learnerGroup');
    if (learnerGroup) {
      this.set('title', learnerGroup.get('title'));
    }
  },
  title: null,

  actions: {
    changeTitle(){
      const learnerGroup = this.get('learnerGroup');
      const title = this.get('title');
      learnerGroup.set('title', title);
      return learnerGroup.save();
    },
    revertTitleChanges(){
      const learnerGroup = this.get('learnerGroup');
      this.set('title', learnerGroup.get('title'));
    },
  }
});
