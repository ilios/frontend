import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class CourseObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;
  @tracked fadeTextExpanded = false;

  constructor() {
    super(...arguments);
    this.title = this.args.courseObjective.title;
  }

  @cached
  get hasErrorForTitleData() {
    return new TrackedAsyncData(this.hasErrorFor('title'));
  }

  get hasErrorForTitle() {
    return this.hasErrorForTitleData.isResolved ? this.hasErrorForTitleData.value : false;
  }

  @cached
  get parentsData() {
    return new TrackedAsyncData(this.args.courseObjective.programYearObjectives);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.courseObjective.meshDescriptors);
  }

  get parents() {
    return this.parentsData.isResolved ? this.parentsData.value : null;
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : null;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors || this.isManagingTerms;
  }

  get fadeTextIsExpanded() {
    return this.fadeTextExpanded;
  }

  saveTitleChanges = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.courseObjective.set('title', this.title);
    await this.args.courseObjective.save();
  });

  manageParents = dropTask(async () => {
    const objectives = this.args.cohortObjectives.reduce((set, cohortObject) => {
      const cohortObjectives = mapBy(cohortObject.competencies, 'objectives');
      return [...set, ...cohortObjectives.flat()];
    }, []);
    const parents = await this.args.courseObjective.programYearObjectives;
    this.parentsBuffer = parents.map((objective) => {
      return findById(objectives, objective.id);
    });
    this.isManagingParents = true;
  });

  manageDescriptors = dropTask(async () => {
    this.descriptorsBuffer = await this.args.courseObjective.meshDescriptors;
    this.isManagingDescriptors = true;
  });

  manageTerms = dropTask(async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    const terms = await this.args.courseObjective.terms;
    this.termsBuffer = terms;
    this.isManagingTerms = true;
  });

  highlightSave = restartableTask(async () => {
    await timeout(1000);
  });

  saveParents = dropTask(async () => {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('program-year-objective', obj.id);
    });
    this.args.courseObjective.set('programYearObjectives', newParents);
    await this.args.courseObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  });

  saveDescriptors = dropTask(async () => {
    this.args.courseObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.courseObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = dropTask(async () => {
    this.args.courseObjective.set('terms', this.termsBuffer);
    await this.args.courseObjective.save();
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
    this.title = this.args.courseObjective.title;
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
  removeParentsWithCohortFromBuffer(cohort) {
    const cohortObjectives = mapBy(cohort.competencies, 'objectives');
    const ids = mapBy([...cohortObjectives.flat()], 'id');
    this.parentsBuffer = this.parentsBuffer.filter((obj) => {
      return !ids.includes(obj.id);
    });
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
    await this.args.courseObjective.destroyRecord();
  });
}
