import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LearnerGroupRoute extends Route {
  @service session;
  @service dataLoader;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return this.dataLoader.loadLearnerGroup(params.learner_group_id);
  }

  async afterModel(learnerGroup) {
    await this.dataLoader.loadLearnerGroup(learnerGroup.id);
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    const school = await program.school;
    await Promise.all([
      this.dataLoader.loadCohortLearnerGroups(cohort.id),
      this.dataLoader.loadInstructorGroupsForSchool(school.id),
    ]);
  }
}
