import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';
import { service } from '@ember/service';

export default class ProgramYearListComponent extends Component {
  @service store;
  @service iliosConfig;
  @tracked editorOn = false;
  @tracked savedProgramYear;
  @service fetch;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get programYearsData() {
    return new TrackedAsyncData(this.args.program.programYears);
  }

  get programYears() {
    return this.programYearsData.isResolved ? this.programYearsData.value : [];
  }

  get sortedProgramYears() {
    return sortBy(this.programYears, 'startYear');
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  saveNew = dropTask(async (startYear) => {
    const latestProgramYear = this.sortedProgramYears.reverse()[0];
    const newProgramYear = this.store.createRecord('program-year', {
      program: this.args.program,
      startYear,
    });

    if (latestProgramYear) {
      const directors = await latestProgramYear.directors;
      const competencies = await latestProgramYear.competencies;
      const terms = await latestProgramYear.terms;
      newProgramYear.set('directors', directors);
      newProgramYear.set('competencies', competencies);
      newProgramYear.set('terms', terms);
    }
    const savedProgramYear = await newProgramYear.save();
    if (latestProgramYear) {
      const relatedObjectives = await latestProgramYear.programYearObjectives;
      const programYearObjectives = sortBy(relatedObjectives, 'id');

      const newObjectiveObjects = programYearObjectives.map((pyoToCopy) => {
        const terms = pyoToCopy
          .hasMany('terms')
          .ids()
          .map((id) => {
            return {
              id,
              type: 'programYearObjectives',
            };
          });
        const meshDescriptors = pyoToCopy
          .hasMany('meshDescriptors')
          .ids()
          .map((id) => {
            return {
              id,
              type: 'meshDescriptors',
            };
          });

        const ancestorId = pyoToCopy.belongsTo('ancestor').id() ?? pyoToCopy.id;

        const rhett = {
          type: 'programYearObjectives',
          attributes: {
            position: pyoToCopy.position,
            title: pyoToCopy.title,
            active: true,
          },
          relationships: {
            programYear: {
              data: {
                type: 'programYear',
                id: savedProgramYear.id,
              },
            },
            ancestor: {
              data: {
                type: 'programYearObjective',
                id: ancestorId,
              },
            },
            meshDescriptors: { data: meshDescriptors },
            terms: { data: terms },
          },
        };
        const competencyId = pyoToCopy.belongsTo('competency').id();
        if (competencyId) {
          rhett.relationships.competency = {
            data: {
              type: 'competency',
              id: competencyId,
            },
          };
        }

        return rhett;
      });
      const newProgramYearObjectives = await this.fetch.postManyToApi(
        `programyearobjectives`,
        newObjectiveObjects,
      );
      this.store.pushPayload(newProgramYearObjectives);
    }
    this.savedProgramYear = newProgramYear;
    this.editorOn = false;
  });
}
