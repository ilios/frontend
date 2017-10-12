import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

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
