import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { waitForProperty } from 'ember-concurrency';
import { action } from '@ember/object';
import scrollTo from 'ilios-common/utils/scroll-to';

export default class SessionObjectivesComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;

  @tracked manageParentsObjective;
  @tracked parentsBuffer = [];
  @tracked manageDescriptorsObjective;
  @tracked descriptorsBuffer = [];

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;

  @tracked objectives;
  @tracked courseObjectives;

  @restartableTask
  *load(event, [session]) {
    if (!session) {
      return;
    }
    this.objectives = yield (session.objectives).toArray();
    const course = yield session.course;
    this.courseObjectives = yield course.sortedObjectives;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors;
  }

  get isManagingParents() {
    return !!this.manageParentsObjective;
  }
  get isManagingDescriptors() {
    return !!this.manageDescriptorsObjective;
  }

  get showCollapsible(){
    return this.objectives?.length && !this.isManaging;
  }

  @dropTask
  *manageParents(objective) {
    const courseObjectives = yield waitForProperty(this, 'courseObjectives', Array.isArray);
    const parents = yield objective.parents;
    this.parentsBuffer = parents.map(objective => {
      return courseObjectives.findBy('id', objective.id);
    });
    this.manageParentsObjective = objective;
  }
  @dropTask
  *manageDescriptors(objective) {
    const meshDescriptors = yield objective.meshDescriptors;
    scrollTo('.detail-objectives', 1000);
    this.descriptorsBuffer = meshDescriptors.toArray();
    this.manageDescriptorsObjective = objective;
  }

  @dropTask
  *save() {
    if(this.isManagingParents){
      yield this.saveParents.perform();
    }
    if(this.isManagingDescriptors){
      yield this.saveMesh.perform();
    }
  }

  @dropTask
  *saveParents() {
    const objective = this.manageParentsObjective;
    const newParents = this.parentsBuffer.map(obj => {
      return this.store.peekRecord('objective', obj.id);
    });
    objective.set('parents', newParents);
    yield objective.save();
    this.manageParentsObjective = null;
    scrollTo("#objective-" + objective.get('id'));
  }

  @dropTask
  *saveMesh() {
    const objective = this.manageDescriptorsObjective;
    objective.set('meshDescriptors', this.descriptorsBuffer);
    yield objective.save();
    this.manageDescriptorsObjective = null;
    scrollTo("#objective-" + objective.get('id'));
  }

  @dropTask
  *saveNewObjective(title) {
    const newObjective = this.store.createRecord('objective');
    newObjective.set('title', title);
    let position = 0;

    if (this.objectives?.length) {
      position = this.objectives.sortBy('position').lastObject.position + 1;
    }

    newObjective.set('position', position);
    newObjective.set('sessions', [this.args.session]);

    yield newObjective.save();
    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  }

  @action
  cancel() {
    this.manageParentsObjective = null;
    this.manageDescriptorsObjective = null;
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
    if (this.objectives.length) {
      this.args.collapse();
    }
  }
  @action
  addParentToBuffer(objective) {
    this.parentsBuffer = [...this.parentsBuffer, objective];
  }
  @action
  removeParentFromBuffer(objective) {
    this.parentsBuffer = this.parentsBuffer.filter(obj => obj.id !== objective.id);
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.descriptorsBuffer = [...this.descriptorsBuffer, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.descriptorsBuffer = this.descriptorsBuffer.filter(obj => obj.id !== descriptor.id);
  }
}
