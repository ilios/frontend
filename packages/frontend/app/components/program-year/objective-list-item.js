import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import { findById } from 'ilios-common/utils/array-helpers';

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
  @tracked selectedVocabulary;
  @tracked fadeTextExpanded = false;

  constructor() {
    super(...arguments);
    this.title = this.args.programYearObjective.title;
  }

  @cached
  get hasErrorForTitleData() {
    return new TrackedAsyncData(this.hasErrorFor('title'));
  }

  get hasErrorForTitle() {
    return this.hasErrorForTitleData.isResolved ? this.hasErrorForTitleData.value : false;
  }

  @cached
  get upstreamRelationshipsData() {
    return new TrackedAsyncData(this.resolveUpstreamRelationships(this.args.programYearObjective));
  }

  get upstreamRelationships() {
    return this.upstreamRelationshipsData.isResolved ? this.upstreamRelationshipsData.value : null;
  }

  get programYear() {
    return this.upstreamRelationships?.programYear;
  }

  get program() {
    return this.upstreamRelationships?.program;
  }

  get school() {
    return this.upstreamRelationships?.school;
  }

  get vocabularies() {
    return this.upstreamRelationships?.vocabularies;
  }

  get meshDescriptors() {
    return this.upstreamRelationships?.meshDescriptors;
  }

  get assignableVocabularies() {
    return this.vocabularies ?? [];
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

  async resolveUpstreamRelationships(programYearObjective) {
    const programYear = await programYearObjective.programYear;
    const meshDescriptors = await programYearObjective.meshDescriptors;
    const program = await programYear.program;
    const school = await program.school;
    const vocabularies = await school.vocabularies;

    return { meshDescriptors, programYear, program, school, vocabularies };
  }

  saveTitleChanges = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.programYearObjective.set('title', this.title);
    await this.args.programYearObjective.save();
    this.highlightSave.perform();
  });

  saveIsActive = dropTask(async (active) => {
    this.args.programYearObjective.set('active', active);
    await this.args.programYearObjective.save();
    this.highlightSave.perform();
  });

  manageCompetency = dropTask(async () => {
    this.competencyBuffer = await this.args.programYearObjective.competency;
    this.isManagingCompetency = true;
  });

  manageDescriptors = dropTask(async () => {
    const meshDescriptors = await this.args.programYearObjective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors;
    this.isManagingDescriptors = true;
  });

  manageTerms = dropTask(async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    const terms = await this.args.programYearObjective.terms;
    this.termsBuffer = terms;
    this.isManagingTerms = true;
  });

  highlightSave = restartableTask(async () => {
    await timeout(1000);
  });

  saveCompetency = dropTask(async () => {
    this.args.programYearObjective.set('competency', this.competencyBuffer);
    await this.args.programYearObjective.save();
    this.competencyBuffer = null;
    this.isManagingCompetency = false;
    this.highlightSave.perform();
  });

  saveDescriptors = dropTask(async () => {
    this.args.programYearObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.programYearObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = dropTask(async () => {
    this.args.programYearObjective.set('terms', this.termsBuffer);
    await this.args.programYearObjective.save();
    this.termsBuffer = [];
    this.isManagingTerms = false;
    this.highlightSave.perform();
  });

  @action
  expandAllFadeText(isExpanded) {
    this.fadeTextExpanded = isExpanded;
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
    this.competencyBuffer = findById(this.args.programYearCompetencies, competencyId);
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

  deleteObjective = dropTask(async () => {
    await this.args.programYearObjective.destroyRecord();
  });
}
