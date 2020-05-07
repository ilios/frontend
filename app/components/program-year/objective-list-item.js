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
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked objective;
  @tracked selectedVocabulary;
  @tracked assignableVocabularies;

  @restartableTask
  *load(element, [programYearObjective]) {
    if (!programYearObjective) {
      return;
    }
    const programYear = yield programYearObjective.programYear;
    const program = yield programYear.program;
    const school = yield program.school;
    const vocabularies = yield school.vocabularies;
    this.assignableVocabularies = vocabularies.toArray();
    this.objective = yield programYearObjective.objective;
    this.title = this.objective.title;
  }


  get isManaging() {
    return this.isManagingCompetency || this.isManagingDescriptors || this.isManagingTerms || this.isExpanded;
  }

  get canDelete() {
    return this.objective?.hasMany('children').ids().length === 0;
  }

  @dropTask
  *saveTitleChanges() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.objective.set('title', this.title);
    yield this.objective.save();
    this.highlightSave.perform();
  }

  @dropTask
  *saveIsActive(active) {
    this.objective.set('active', active);
    yield this.objective.save();
    this.highlightSave.perform();
  }

  @dropTask
  *manageCompetency() {
    this.competencyBuffer = yield this.objective.competency;
    this.isManagingCompetency = true;
  }
  @dropTask
  *manageDescriptors() {
    const meshDescriptors = yield this.objective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors.toArray();
    this.isManagingDescriptors = true;
  }

  @dropTask
  *manageTerms(vocabulary) {
    this.selectedVocabulary = vocabulary;
    const terms = yield this.args.programYearObjective.terms;
    this.termsBuffer = terms.toArray();
    this.isManagingTerms = true;
  }


  @restartableTask
  *highlightSave() {
    yield timeout(1000);
  }

  @dropTask
  *saveCompetency() {
    this.objective.set('competency', this.competencyBuffer);
    yield this.objective.save();
    this.competencyBuffer = null;
    this.isManagingCompetency = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveDescriptors() {
    this.objective.set('meshDescriptors', this.descriptorsBuffer);
    yield this.objective.save();
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
    this.title = this.objective.title;
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
  addTermToBuffer(term) {
    this.termsBuffer = [...this.termsBuffer, term];
  }
  @action
  removeTermFromBuffer(term) {
    this.termsBuffer = this.termsBuffer.filter(obj => obj.id !== term.id);
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
    yield this.objective.destroyRecord();
  }
}
