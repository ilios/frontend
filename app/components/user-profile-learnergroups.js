/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import RSVP from 'rsvp';
import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
const { map } = RSVP;

export default Component.extend({
  classNameBindings: [':user-profile-learnergroups', ':large-component'],

  user: null,

  selectedLearnerGroups: computed('user.learnerGroups.[]', async function() {
    const user = this.get('user');
    if (isEmpty(user)) {
      return [];
    }
    const learnerGroups = await user.get('learnerGroups');
    const groupObjects = await map(learnerGroups.toArray(), async learnerGroup => {
      const cohort = await learnerGroup.get('cohort');
      const program = await cohort.get('program');
      const school = await program.get('school');
      const allParentsTitle = await learnerGroup.get('allParentsTitle');
      const title = learnerGroup.get('title');
      const schoolTitle = school.get('title');
      const programTitle = program.get('title');
      const cohortTitle = cohort.get('title');
      return EmberObject.create({
        allParentsTitle,
        title,
        schoolTitle,
        programTitle,
        cohortTitle,
        sortTitle: schoolTitle + programTitle + cohortTitle + allParentsTitle + title
      });
    });
    return groupObjects.sortBy('sortTitle');
  })
});
