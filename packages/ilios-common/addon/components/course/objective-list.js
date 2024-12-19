import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { map } from 'rsvp';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { findById } from 'ilios-common/utils/array-helpers';
export default class CourseObjectiveListComponent extends Component {
  @service store;
  @service intl;
  @tracked isSorting = false;

  @cached
  get courseObjectivesAsyncData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  @cached
  get courseCohortsAsyncData() {
    return new TrackedAsyncData(this.args.course.cohorts);
  }

  get courseObjectivesAsync() {
    return this.courseObjectivesAsyncData.isResolved ? this.courseObjectivesAsyncData.value : null;
  }

  get courseObjectives() {
    if (this.courseObjectivesAsync) {
      return this.courseObjectivesAsync.slice().sort(sortableByPosition);
    }

    return undefined;
  }

  get courseCohortsAsync() {
    return this.courseCohortsAsyncData.isResolved ? this.courseCohortsAsyncData.value : null;
  }

  get courseCohorts() {
    if (this.courseCohortsAsync) {
      return this.courseCohortsAsync;
    }

    return [];
  }

  @cached
  get cohortObjectivesData() {
    return new TrackedAsyncData(this.getCohortObjectives(this.courseCohorts, this.intl));
  }

  get cohortObjectives() {
    return this.cohortObjectivesData.isResolved ? this.cohortObjectivesData.value : [];
  }

  get cohortObjectivesLoaded() {
    return this.cohortObjectivesData.isResolved;
  }

  get courseObjectiveCount() {
    if (this.courseObjectives) {
      return this.courseObjectives.length;
    }

    return this.args.course.hasMany('courseObjectives').ids().length;
  }

  async getCohortObjectives(cohorts, intl) {
    return await map(cohorts, async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;
      const allowMultipleCourseObjectiveParents = await school.getConfigValue(
        'allowMultipleCourseObjectiveParents',
      );
      const objectives = await programYear.programYearObjectives;
      const objectiveObjects = await map(objectives, async (objective) => {
        let competencyId = 0;
        let competencyTitle = intl.t('general.noAssociatedCompetency');
        let competencyParent = null;
        const competency = await objective.competency;
        if (competency) {
          competencyId = competency.id;
          competencyTitle = competency.title;
          competencyParent = await competency.parent;
        }
        return {
          id: objective.id,
          title: objective.title,
          active: objective.active,
          competencyId,
          competencyTitle,
          competencyParent,
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
            parent: obj.competencyParent,
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
