import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class ProgramYearListComponent extends Component {
  @service store;
  @service iliosConfig;
  @tracked editorOn = false;

  @tracked itemsToSave;
  @tracked savedItems;
  @tracked savedProgramYear;

  @use programYears = new ResolveAsyncValue(() => [this.args.program.programYears, []]);
  get sortedProgramYears() {
    return this.programYears.sortBy('startYear');
  }
  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries')
  ]);

  @dropTask
  *saveNew(startYear) {
    const latestProgramYear = this.sortedProgramYears.get('lastObject');
    this.itemsToSave = 0;
    this.savedItems = 0;

    const newProgramYear = this.store.createRecord('program-year', {
      program: this.args.program,
      startYear,
    });
    this.itemsToSave++;

    if (latestProgramYear) {
      newProgramYear.directors.pushObjects(yield latestProgramYear.directors);
      newProgramYear.competencies.pushObjects(yield latestProgramYear.competencies);
      newProgramYear.terms.pushObjects(yield latestProgramYear.terms);
    }
    const savedProgramYear = yield newProgramYear.save();
    this.savedItems++;

    if (latestProgramYear) {
      const relatedObjectives = yield latestProgramYear.programYearObjectives;
      const programYearObjectives = relatedObjectives.sortBy('id').toArray();
      this.itemsToSave += programYearObjectives.length;

      for (let i = 0; i < programYearObjectives.length; i++) {
        const programYearObjectiveToCopy = programYearObjectives[i];
        const terms = yield programYearObjectiveToCopy.terms;
        const meshDescriptors = yield programYearObjectiveToCopy.meshDescriptors;
        const competency = yield programYearObjectiveToCopy.competency;
        let ancestor = yield programYearObjectiveToCopy.ancestor;

        if (!ancestor) {
          ancestor = programYearObjectiveToCopy;
        }

        const newProgramYearObjective = this.store.createRecord('program-year-objective', {
          position: programYearObjectiveToCopy.position,
          programYear: savedProgramYear,
          title: programYearObjectiveToCopy.title,
          ancestor,
          meshDescriptors,
          competency,
          terms
        });
        yield newProgramYearObjective.save();
        this.savedItems++;
      }
    }
    this.savedProgramYear = newProgramYear;
    this.editorOn = false;
  }

}
