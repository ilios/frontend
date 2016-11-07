import Ember from 'ember';
import pad from 'ember-pad/utils/pad';
import countDigits from '../utils/count-digits';

const { Component, RSVP, inject } = Ember;
const { service } = inject;
const { Promise } = RSVP;

export default Component.extend({
  store: service(),
  parentGroup: null,
  classNames: ['learnergroup-subgroup-list'],
  tagName: 'section',
  showNewLearnerGroupForm: false,
  isSaving: false,
  actions: {
    saveNewLearnerGroup(title) {
      return new Promise (resolve => {
        const { store, parentGroup } = this.getProperties('store', 'parentGroup');

        parentGroup.get('cohort').then((cohort) => {
          let newLearnerGroup = store.createRecord('learner-group', { title, parent: parentGroup, cohort });

          newLearnerGroup.save().then((savedLearnerGroup) => {
            this.set('showNewLearnerGroupForm', false);
            resolve(savedLearnerGroup);
          });
        });
      });

    },
    generateNewLearnerGroups(num) {
      const { store, parentGroup } = this.getProperties('store', 'parentGroup');

      this.set('totalGroupsToSave', num);
      this.set('currentGroupsSaved', 0);
      this.set('isSaving', true);

      return new Promise (resolve => {
        parentGroup.get('subgroupNumberingOffset').then((offset) => {
          parentGroup.get('cohort').then((cohort) => {
            let groups = [];
            const padBy = countDigits(offset + parseInt(num, 10));
            for (let i = 0; i < num; i++) {
              let newGroup = store.createRecord('learner-group', {
                title: parentGroup.get('title') + ' ' + pad(offset + i, padBy),
                parent: parentGroup,
                cohort
              });
              groups.pushObject(newGroup);
            }

            let saveSomeGroups = (groups) => {
              let chunk = groups.splice(0, 6);

              RSVP.all(chunk.invoke('save')).then(() => {
                if (groups.length){
                  this.set('currentGroupsSaved', this.get('currentGroupsSaved') + chunk.length);
                  saveSomeGroups(groups);
                } else {
                  this.set('isSaving', false);
                  this.set('showNewLearnerGroupForm', false);
                  this.get('flashMessages').success('general.savedSuccessfully');
                  resolve();
                }
              });
            };
            saveSomeGroups(groups);
          });
        });
      });
    },
    removeLearnerGroup(learnerGroup) {
      return learnerGroup.destroyRecord();
    },
  }
});
