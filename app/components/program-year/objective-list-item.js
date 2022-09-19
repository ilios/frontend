import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

@validatable
export default class ProgramYearObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title = this.args.programYearObjective.title;
  @tracked isManagingCompetency;
  @tracked competencyBuffer;
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isExpanded = false;
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;

  @use programYear = new ResolveAsyncValue(() => [this.args.programYearObjective.programYear]);
  @use program = new ResolveAsyncValue(() => [this.programYear?.program]);
  @use school = new ResolveAsyncValue(() => [this.program?.school]);
  @use vocabularies = new ResolveAsyncValue(() => [this.school?.vocabularies]);

  get assignableVocabularies() {
    return this.vocabularies?.slice() ?? [];
  }

  get isManaging() {
    return (
      this.isManagingCompetency ||
      this.isManagingDescriptors ||
      this.isManagingTerms ||
      this.isExpanded
    );
  }

  get canDelete() {
    return this.args.programYearObjective.courseObjectives.length === 0;
  }

  @dropTask
  *saveTitleChanges() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.programYearObjective.set('title', this.title);
    yield this.args.programYearObjective.save();
    this.highlightSave.perform();
  }

  @dropTask
  *saveIsActive(active) {
    this.args.programYearObjective.set('active', active);
    yield this.args.programYearObjective.save();
    this.highlightSave.perform();
  }

  @dropTask
  *manageCompetency() {
    this.competencyBuffer = yield this.args.programYearObjective.competency;
    this.isManagingCompetency = true;
  }
  @dropTask
  *manageDescriptors() {
    const meshDescriptors = yield this.args.programYearObjective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors.slice();
    this.isManagingDescriptors = true;
  }

  @dropTask
  *manageTerms(vocabulary) {
    this.selectedVocabulary = vocabulary;
    const terms = yield this.args.programYearObjective.terms;
    this.termsBuffer = terms.slice();
    this.isManagingTerms = true;
  }

  @restartableTask
  *highlightSave() {
    yield timeout(1000);
  }

  @dropTask
  *saveCompetency() {
    this.args.programYearObjective.set('competency', this.competencyBuffer);
    yield this.args.programYearObjective.save();
    this.competencyBuffer = null;
    this.isManagingCompetency = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveDescriptors() {
    this.args.programYearObjective.set('meshDescriptors', this.descriptorsBuffer);
    yield this.args.programYearObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveTerms() {
    this.args.programYearObjective.set('terms', this.termsBuffer);
    yield this.args.programYearObjective.save();
    this.termsBuffer = [];
    this.isManagingTerms = false;
    this.highlightSave.perform();
  }

  @action
  revertTitleChanges() {
    this.title = this.args.programYearObjective.title;
    this.removeErrorDisplayFor('title');
  }
  @action
  changeTitle(contents) {
    this.title = contents;
    this.addErrorDisplayFor('title');
  }
  @action
  setCompetencyBuffer(competencyId) {
    this.competencyBuffer = this.args.programYearCompetencies.findBy('id', competencyId);
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
    this.competencyBuffer = null;
    this.descriptorsBuffer = [];
    this.termsBuffer = [];
    this.isManagingCompetency = false;
    this.isManagingDescriptors = false;
    this.isManagingTerms = false;
    this.selectedVocabulary = null;
  }
  @dropTask
  *deleteObjective() {
    yield this.args.programYearObjective.destroyRecord();
  }
}
