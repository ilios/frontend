import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class ProgramYearObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingCompetency;
  @tracked competencyBuffer;
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isExpanded = false;

  constructor() {
    super(...arguments);
    this.title = this.args.objective.title;
  }

  get isManaging() {
    return this.isManagingCompetency || this.isManagingDescriptors || this.isExpanded;
  }

  get canDelete() {
    return this.args.objective.hasMany('children').ids().length === 0;
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
    this.highlightSave.perform();
  }

  @dropTask
  *saveIsActive(active) {
    this.args.objective.set('active', active);
    yield this.args.objective.save();
    this.highlightSave.perform();
  }

  @dropTask
  *manageCompetency() {
    this.competencyBuffer = yield this.args.objective.competency;
    this.isManagingCompetency = true;
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
  *saveCompetency() {
    this.args.objective.set('competency', this.competencyBuffer);
    yield this.args.objective.save();
    this.competencyBuffer = null;
    this.isManagingCompetency = false;
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
  setCompetencyBuffer(competencyId) {
    this.competencyBuffer = this.args.schoolCompetencies.findBy('id', competencyId);
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
    this.competencyBuffer = null;
    this.descriptorsBuffer = [];
    this.isManagingCompetency = false;
    this.isManagingDescriptors = false;
  }
  @dropTask
  *deleteObjective() {
    yield this.args.objective.destroyRecord();
  }
}
