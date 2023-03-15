import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

@validatable
export default class SessionObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;

  @use parents = new ResolveAsyncValue(() => [this.args.sessionObjective.courseObjectives]);
  @use meshDescriptors = new ResolveAsyncValue(() => [this.args.sessionObjective.meshDescriptors]);

  @action
  load(element, [sessionObjective]) {
    if (!sessionObjective) {
      return;
    }
    this.title = this.args.sessionObjective.title;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors || this.isManagingTerms;
  }

  saveTitleChanges = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.sessionObjective.set('title', this.title);
    await this.args.sessionObjective.save();
  });

  manageParents = dropTask(async () => {
    const parents = await this.args.sessionObjective.courseObjectives;
    this.parentsBuffer = parents.slice();
    this.isManagingParents = true;
  });

  manageDescriptors = dropTask(async () => {
    const meshDescriptors = await this.args.sessionObjective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors.slice();
    this.isManagingDescriptors = true;
  });

  manageTerms = dropTask(async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    const terms = await this.args.sessionObjective.terms;
    this.termsBuffer = terms.slice();
    this.isManagingTerms = true;
  });

  highlightSave = restartableTask(async () => {
    await timeout(1000);
  });

  saveParents = dropTask(async () => {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('course-objective', obj.id);
    });
    this.args.sessionObjective.set('courseObjectives', newParents);
    await this.args.sessionObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  });

  saveDescriptors = dropTask(async () => {
    this.args.sessionObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.sessionObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = dropTask(async () => {
    this.args.sessionObjective.set('terms', this.termsBuffer);
    await this.args.sessionObjective.save();
    this.termsBuffer = [];
    this.isManagingTerms = false;
    this.highlightSave.perform();
  });

  @action
  revertTitleChanges() {
    this.title = this.args.sessionObjective.title;
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
    this.parentsBuffer = this.parentsBuffer.filter((obj) => obj.id !== objective.id);
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.descriptorsBuffer = [...this.descriptorsBuffer, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.descriptorsBuffer = this.descriptorsBuffer.filter((obj) => obj.id !== descriptor.id);
  }
  @action
  addTermToBuffer(term) {
    this.termsBuffer = [...this.termsBuffer, term];
  }
  @action
  removeTermFromBuffer(term) {
    this.termsBuffer = this.termsBuffer.filter((obj) => obj.id !== term.id);
  }
  @action
  cancel() {
    this.parentsBuffer = [];
    this.descriptorsBuffer = [];
    this.termsBuffer = [];
    this.isManagingParents = false;
    this.isManagingDescriptors = false;
    this.isManagingTerms = false;
    this.selectedVocabulary = null;
  }

  deleteObjective = dropTask(async () => {
    await this.args.sessionObjective.destroyRecord();
  });
}
