import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import layout from '../templates/components/detail-learnergroups';

export default Component.extend({
  layout,
  classNames: ['detail-learnergroups'],
  tagName: 'div',
  subject: null,
  isIlmSession: false,
  editable: true,
  isManaging: false,
  learnerGroups: null,
  'data-test-detail-learner-groups': true,
  collapsible: computed('isManaging', 'learnerGroups.length', function(){
    const isManaging = this.get('isManaging');
    const learnerGroups = this.get('learnerGroups');
    return learnerGroups.get('length') && ! isManaging;
  }),
  init(){
    this._super(...arguments);
    this.set('learnerGroups', []);
    this.get('loadLearnerGroups').perform();
  },
  didUpdateAttrs(){
    this._super(...arguments);
    this.get('loadLearnerGroups').perform();
  },
  actions: {
    cancel(){
      this.get('loadLearnerGroups').perform();
      this.get('setIsManaging')(false);
    },
    addLearnerGroup(learnerGroup) {
      let learnerGroups = this.get('learnerGroups').toArray();
      learnerGroups.addObject(learnerGroup);
      learnerGroup.get('allDescendants').then(function(descendants){
        learnerGroups.addObjects(descendants);
      });
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('learnerGroups', learnerGroups);
    },
    removeLearnerGroup(learnerGroup) {
      let learnerGroups = this.get('learnerGroups').toArray();
      learnerGroups.removeObject(learnerGroup);
      learnerGroup.get('allDescendants').then(function(descendants){
        learnerGroups.removeObjects(descendants);
      });
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('learnerGroups', learnerGroups);
    }
  },
  collapse() {
    if (this.collapsible) {
      this.collapse();
    }
  },
  loadLearnerGroups: task(function * (){
    const subject = this.get('subject');
    if (subject){
      let learnerGroups = yield subject.get('learnerGroups');
      this.set('learnerGroups', learnerGroups.toArray());
    } else {
      yield timeout(1000);
    }
  }).restartable(),
  save: task(function * (){
    yield timeout(10);
    let subject = this.get('subject');
    let learnerGroups = this.get('learnerGroups');
    subject.set('learnerGroups', learnerGroups);
    try {
      yield subject.save();
    } finally {
      this.get('setIsManaging')(false);
      this.get('expand')();
    }
  }),
});
