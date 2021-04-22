import CommonDataLoaderService from 'ilios-common/services/data-loader';

export default class DataLoaderService extends CommonDataLoaderService {
  #loadedLearnerGroupWithCourses = new Map();
  async loadCoursesForLearnerGroup(learnerGroupId) {
    if (!this.#loadedLearnerGroupWithCourses.has(learnerGroupId)) {
      const sessionIncludes = 'offerings.session.course';
      const ilmIncludes = 'ilmSessions.session.course';
      const includes = [];
      for (let i = 0; i < 5; i++) {
        const children = 'children.'.repeat(i);
        includes.push(`${children}${sessionIncludes}`);
        includes.push(`${children}${ilmIncludes}`);
      }

      this.#loadedLearnerGroupWithCourses.set(
        learnerGroupId,
        this.store.findRecord('learner-group', learnerGroupId, {
          reload: true,
          include: includes.join(','),
        })
      );
    }

    return this.#loadedLearnerGroupWithCourses.get(learnerGroupId);
  }
}
