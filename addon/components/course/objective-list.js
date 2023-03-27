import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { findById } from 'ilios-common/utils/array-helpers';

export default class CourseObjectiveListComponent extends Component {
  @service store;
  @service intl;
  @service dataLoader;

  @tracked isSorting = false;

  @use courseObjectivesAsync = new ResolveAsyncValue(() => [this.args.course.courseObjectives]);

  get courseObjectives() {
    if (this.load.lastSuccessful && this.courseObjectivesAsync) {
      return this.courseObjectivesAsync.slice().sort(sortableByPosition);
    }

    return undefined;
  }

  @use courseCohortsAsync = new ResolveAsyncValue(() => [this.args.course.cohorts]);

  get courseCohorts() {
    if (this.load.lastSuccessful && this.courseCohortsAsync) {
      return this.courseCohortsAsync.slice();
    }

    return [];
  }

  @use cohortObjectives = new AsyncProcess(() => [
    this.getCohortObjectives,
    this.courseCohorts,
    this.intl,
  ]);

  get cohortObjectives() {
    if (!this.load.lastSuccessful) {
      return null;
    }
    return this?.cohortObjectiveAsync;
  }

  get courseObjectiveCount() {
    if (this.courseObjectives) {
      return this.courseObjectives.length;
    }

    return this.args.course.hasMany('courseObjectives').ids().length;
  }

  load = restartableTask(async () => {
    //pre-load all session data as well to get access to child objectives
    await this.dataLoader.loadCourseSessions(this.args.course.id);
  });

  async getCohortObjectives(cohorts, intl) {
    return await map(cohorts, async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;
      const allowMultipleCourseObjectiveParents = await school.getConfigValue(
        'allowMultipleCourseObjectiveParents'
      );
      const objectives = await programYear.programYearObjectives;
      const objectiveObjects = await map(objectives.slice(), async (objective) => {
        let competencyId = 0;
        let competencyTitle = intl.t('general.noAssociatedCompetency');
        const competency = await objective.competency;
        if (competency) {
          competencyId = competency.id;
          competencyTitle = competency.title;
        }
        return {
          id: objective.id,
          title: objective.title,
          active: objective.active,
          competencyId,
          competencyTitle,
          cohortId: cohort.id,
        };
      });
      const competencies = objectiveObjects.reduce((set, obj) => {
        let existing = findById(set, obj.competencyId);
        if (!existing) {
          existing = {
            id: obj.competencyId,
            title: obj.competencyTitle,
            objectives: [],
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
