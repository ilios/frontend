import Component from '@glimmer/component';
import { map } from 'rsvp';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class UserProfileLearnergroupsComponent extends Component {
  @tracked selectedLearnerGroups;

  load = restartableTask(async () => {
    this.selectedLearnerGroups = await this.getSelectedLearnerGroups(this.args.user);
  });

  async getSelectedLearnerGroups(user) {
    const learnerGroups = (await user.learnerGroups).slice();
    return await map(learnerGroups, async (learnerGroup) => {
      const cohort = await learnerGroup.get('cohort');
      const program = await cohort.get('program');
      const school = await program.get('school');
      const allParentsTitle = await learnerGroup.get('allParentsTitle');
      const title = learnerGroup.get('title');
      const schoolTitle = school.get('title');
      const programTitle = program.get('title');
      const cohortTitle = cohort.get('title');
      return {
        allParentsTitle,
        title,
        schoolTitle,
        programTitle,
        cohortTitle,
        sortTitle: schoolTitle + programTitle + cohortTitle + allParentsTitle + title,
      };
    });
  }
}
