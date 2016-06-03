import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component } = Ember;

export default Component.extend({
  didReceiveAttrs(){
    this._super(...arguments);
    this.loadLearnerGroups();
  },
  loadLearnerGroups(){
    const subject = this.get('subject');
    if (subject){
      subject.get('learnerGroups').then(learnerGroups => {
        this.set('learnerGroups', learnerGroups.toArray());
      });
    }
  },
  classNames: ['detail-learnergroups'],
  tagName: 'div',
  subject: null,
  isIlmSession: false,
  isManaging: false,
  learnerGroups: [],
  cohorts: [],
  save: task(function * (){
    yield timeout(10);
    let subject = this.get('subject');
    let learnerGroups = this.get('learnerGroups');
    subject.set('learnerGroups', learnerGroups);
    yield subject.save();
    this.get('setIsManaging')(false);
  }),
  actions: {
    cancel(){
      this.loadLearnerGroups()
      this.get('setIsManaging')(false);
    },
    addLearnerGroup: function(learnerGroup){
      let learnerGroups = this.get('learnerGroups').toArray();
      learnerGroups.addObject(learnerGroup);
      learnerGroup.get('allDescendants').then(function(descendants){
        learnerGroups.addObjects(descendants);
      });
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('learnerGroups', learnerGroups);
    },
    removeLearnerGroup: function(learnerGroup){
      let learnerGroups = this.get('learnerGroups').toArray();
      learnerGroups.removeObject(learnerGroup);
      learnerGroup.get('allDescendants').then(function(descendants){
        learnerGroups.removeObjects(descendants);
      });
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('learnerGroups', learnerGroups);
    }
  }
});
