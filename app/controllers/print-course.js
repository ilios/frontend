import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { all } from 'rsvp';

export default Controller.extend({
  currentUser: service(),
  queryParams: ['unpublished'],
  unpublished: false,
  includeUnpublishedSessions: computed('unpublished', 'currentUser.canPrintUnpublishedCourse', async function(){
    const unpublished = this.get('unpublished');
    const currentUser = this.get('currentUser');
    const hasRole = await all([
      currentUser.get('userIsCourseDirector'),
      currentUser.get('userIsFaculty'),
      currentUser.get('userIsDeveloper'),
    ]);
    const canPrintUnpublishedCourse = hasRole.includes(true);

    return unpublished && canPrintUnpublishedCourse;
  })
});
