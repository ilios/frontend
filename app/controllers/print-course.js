import Ember from 'ember';

const { Controller, computed} = Ember;

export default Controller.extend({
  currentUser: Ember.inject.service(),
  queryParams: ['unpublished'],
  unpublished: false,
  includeUnpublishedSessions: computed('unpublished', 'currentUser.canPrintUnpublishedCourse', function(){
    const unpublished = this.get('unpublished');
    const canPrintUnpublishedCourse = this.get('currentUser.canPrintUnpublishedCourse');

    return unpublished && canPrintUnpublishedCourse;
  })
});
