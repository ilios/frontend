import Ember from 'ember';

const { Controller, inject } = Ember;
const { controller } = inject;

export default Controller.extend({
  queryParams: [
    'sessionObjectiveDetails',
    'sessionTaxonomyDetails',
    'isManagingLearnerGroups',
    'sessionLearnergroupDetails',
  ],
  sessionObjectiveDetails: false,
  sessionTaxonomyDetails: false,
  isManagingLearnerGroups: false,
  sessionLearnergroupDetails: false,

  sessionController: controller('session'),
  courseController: controller('course'),

  actions: {
    setSessionOffset(offset){
      this.set('sessionOffset', offset);
    },
    setSessionLimit(limit){
      this.set('sessionLimit', limit);
    },
  }
});
