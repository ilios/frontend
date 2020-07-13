import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class SessionObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;
  @tracked objectiveCount;

  get showCollapsible(){
    return this.hasObjectives && !this.isManaging;
  }

  get hasObjectives() {
    return this.objectiveCount > 0;
  }

  @action
  load(element, [session]) {
    this.objectiveCount = session.hasMany('sessionObjectives').ids().length;
  }

  @dropTask
  *saveNewObjective(title) {
    const newSessionObjective = this.store.createRecord('session-objective');
    let position = 0;
    const sessionObjectives = yield this.args.session.sessionObjectives;
    if (sessionObjectives.length) {
      position = sessionObjectives.sortBy('position').lastObject.position + 1;
    }

    newSessionObjective.set('title', title);
    newSessionObjective.set('position', position);
    newSessionObjective.set('session', this.args.session);

    yield newSessionObjective.save();

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
