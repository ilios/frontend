import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ProgramYearObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;
  @tracked objectiveCount;

  get showCollapsible() {
    return this.hasObjectives && !this.isManaging;
  }

  get hasObjectives() {
    return this.objectiveCount > 0;
  }

  @action
  load(element, [programYear]) {
    this.objectiveCount = programYear.hasMany('programYearObjectives').ids().length;
  }

  @dropTask
  *saveNewObjective(title) {
    const programYearObjectives = yield this.args.programYear.programYearObjectives;
    const position = programYearObjectives.length
      ? sortBy(programYearObjectives.slice(), 'position').reverse()[0].position + 1
      : 0;

    const newProgramYearObjective = this.store.createRecord('program-year-objective');
    newProgramYearObjective.set('title', title);
    newProgramYearObjective.set('position', position);
    newProgramYearObjective.set('programYear', this.args.programYear);

    yield newProgramYearObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  }

  @action
  toggleNewObjectiveEditor() {
    //force expand the objective component
    //otherwise adding the first new objective will cause it to close
    this.args.expand();
    this.newObjectiveEditorOn = !this.newObjectiveEditorOn;
  }
  @action
  collapse() {
    if (this.hasObjectives) {
      this.args.collapse();
    }
  }
}
