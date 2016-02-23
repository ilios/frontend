import Ember from 'ember';

const { Controller, computed, inject } = Ember;
const { service } = inject;

export default Controller.extend({
  currentUser: service(),
  queryParams: ['unpublished'],
  unpublished: false,
  includeUnpublishedSessions: computed('unpublished', 'currentUser.canPrintUnpublishedCourse', function(){
    const unpublished = this.get('unpublished');
    const canPrintUnpublishedCourse = this.get('currentUser.canPrintUnpublishedCourse');

    return unpublished && canPrintUnpublishedCourse;
  })
});
