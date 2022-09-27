import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class ProgramYearListComponent extends Component {
  @service store;
  @service iliosConfig;
  @tracked editorOn = false;
  @tracked savedProgramYear;
  @service fetch;

  @use programYears = new ResolveAsyncValue(() => [this.args.program.programYears, []]);
  get sortedProgramYears() {
    return sortBy(this.programYears.slice(), 'startYear');
  }
  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  ]);

  saveNew = dropTask(async (startYear) => {
    const latestProgramYear = this.sortedProgramYears.reverse()[0];
    const newProgramYear = this.store.createRecord('program-year', {
      program: this.args.program,
      startYear,
    });

    if (latestProgramYear) {
      const directors = (await latestProgramYear.directors).slice();
      const competencies = (await latestProgramYear.competencies).slice();
      const terms = (await latestProgramYear.terms).slice();
      newProgramYear.set('directors', directors);
      newProgramYear.set('competencies', competencies);
      newProgramYear.set('terms', terms);
    }
    const savedProgramYear = await newProgramYear.save();
    if (latestProgramYear) {
      const relatedObjectives = await latestProgramYear.programYearObjectives;
      const programYearObjectives = sortBy(relatedObjectives.slice(), 'id');

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
        newObjectiveObjects
      );
      this.store.pushPayload(newProgramYearObjectives);
    }
    this.savedProgramYear = newProgramYear;
    this.editorOn = false;
  });
}
