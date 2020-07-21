import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { hash, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default class CourseObjectiveListComponent extends Component {
  @service store;
  @service intl;
  @service dataLoader;

  @tracked courseObjectives;
  @tracked isSorting = false;
  @tracked cohortObjectives;
  @tracked courseObjectiveCount;

  @restartableTask
  *load(element, [course]) {
    if (!course) {
      return;
    }
    //pre-load all session data as well to get access to child objectives
    yield this.dataLoader.loadCourseSessions(course.id);
    this.courseObjectiveCount = course.hasMany('courseObjectives').ids().length;
    const {
      courseObjectives,
      cohortObjectives
    } = yield hash({
      courseObjectives: course.sortedCourseObjectives,
      cohortObjectives: this.getCohortObjectives(course)
    });
    this.courseObjectives = courseObjectives;
    this.cohortObjectives = cohortObjectives;
  }

  async getCohortObjectives(course) {
    const cohorts = (await course.cohorts).toArray();
    return await map(cohorts, async cohort => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;
      const allowMultipleCourseObjectiveParents = await school.getConfigValue('allowMultipleCourseObjectiveParents');
      const objectives = await programYear.programYearObjectives;
      const objectiveObjects = await map(objectives.toArray(), async objective => {
        let competencyId = 0;
        let competencyTitle = this.intl.t('general.noAssociatedCompetency');
        const competency = await objective.competency;
        if (competency) {
          competencyId = competency.id;
          competencyTitle = competency.title;
        }
        return {
          id: objective.id,
          title: objective.textTitle,
          active: objective.active,
          competencyId,
          competencyTitle,
          cohortId: cohort.id,
        };
      });
      const competencies = objectiveObjects.reduce((set, obj) => {
        let existing = set.findBy('id', obj.competencyId);
        if (!existing) {
          existing = {
            id: obj.competencyId,
            title: obj.competencyTitle,
            objectives: []
          };
          set.push(existing);
        }
        existing.objectives.push(obj);
        return set;
      }, []);

      return {
        title: `${program.title} ${cohort.title}`,
        id: cohort.id,
        allowMultipleParents: allowMultipleCourseObjectiveParents,
        competencies,
      };
    });
  }
}
