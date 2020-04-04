import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { hash, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default class CourseObjectiveListComponent extends Component {
  @service store;
  @service intl;

  @tracked objectives;
  @tracked isSorting = false;
  @tracked cohortObjectives;
  @tracked objectiveCount;

  @restartableTask
  *load(element, [course]) {
    if (!course) {
      return;
    }
    this.objectiveCount = course.hasMany('objectives').ids().length;
    const {
      objectives,
      cohortObjectives
    } = yield hash({
      objectives: course.sortedObjectives,
      cohortObjectives: this.getCohortObjectives(course)
    });
    this.objectives = objectives;
    this.cohortObjectives = cohortObjectives;
  }

  async getCohortObjectives(course) {
    const cohorts = (await course.cohorts).toArray();
    const programYears = cohorts.map(c => c.belongsTo('programYear').id());
    if (programYears.length) {
      await this.store.query('objective', {
        filters: {
          programYears,
        },
      });
    }
    return await map(cohorts, async cohort => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const objectives = (await programYear.objectives).toArray();
      const objectiveObjects = await map(objectives, async objective => {
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
        competencies,
      };
    });
  }
}
