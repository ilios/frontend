import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';

export default class SessionObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;
  @tracked objectivesRelationship;

  get showCollapsible() {
    return this.hasObjectives && !this.isManaging;
  }

  get hasObjectives() {
    return this.objectiveCount > 0;
  }

  get objectiveCount() {
    return this.objectivesRelationship ? this.objectivesRelationship.length : 0;
  }

  load = restartableTask(async () => {
    this.objectivesRelationship = await this.args.session.sessionObjectives;
  });

  saveNewObjective = dropTask(async (title) => {
    const newSessionObjective = this.store.createRecord('session-objective');
    let position = 0;
    const sessionObjectives = await this.args.session.sessionObjectives;
    if (sessionObjectives.length) {
      position = sessionObjectives.sortBy('position').lastObject.position + 1;
    }

    newSessionObjective.set('title', title);
    newSessionObjective.set('position', position);
    newSessionObjective.set('session', this.args.session);

    await newSessionObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  });

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
