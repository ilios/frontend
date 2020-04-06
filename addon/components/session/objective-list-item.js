import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class SessionObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];

  constructor() {
    super(...arguments);
    this.title = this.args.objective.title;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors;
  }

  @dropTask
  *saveTitleChanges() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.objective.set('title', this.title);
    yield this.args.objective.save();
  }

  @dropTask
  *manageParents() {
    const parents = yield this.args.objective.parents;
    this.parentsBuffer = parents.toArray();
    this.isManagingParents = true;
  }
  @dropTask
  *manageDescriptors() {
    const meshDescriptors = yield this.args.objective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors.toArray();
    this.isManagingDescriptors = true;
  }

  @restartableTask
  *highlightSave() {
    yield timeout(1000);
  }

  @dropTask
  *saveParents() {
    const newParents = this.parentsBuffer.map(obj => {
      return this.store.peekRecord('objective', obj.id);
    });
    this.args.objective.set('parents', newParents);
    yield this.args.objective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveDescriptors() {
    this.args.objective.set('meshDescriptors', this.descriptorsBuffer);
    yield this.args.objective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  }

  @action
  revertTitleChanges() {
    this.title = this.args.objective.title;
    this.removeErrorDisplayFor('title');
  }
  @action
  changeTitle(contents) {
    this.title = contents;
    this.addErrorDisplayFor('title');
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
  @action
  cancel() {
    this.parentsBuffer = [];
    this.descriptorsBuffer = [];
    this.isManagingParents = false;
    this.isManagingDescriptors = false;
  }
  @dropTask
  *deleteObjective() {
    yield this.args.objective.destroyRecord();
  }
}
