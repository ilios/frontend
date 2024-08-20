import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { validatable, Custom, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

@validatable
export default class SchoolVocabularyTermManagerComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;

  @tracked
  @NotBlank()
  @Length(1, 200)
  @Custom('validateTitleCallback', 'validateTitleMessageCallback')
  titleValue;

  @tracked descriptionValue;
  @tracked newTerm;

  get title() {
    return this.titleValue || this.args.term.title;
  }

  get description() {
    return this.descriptionValue || this.args.term.description;
  }

  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.term.children);
  }

  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.term.getAllParents());
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : null;
  }

  @cached
  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : null;
  }

  get isLoading() {
    return !this.children || !this.allParents;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('titleValue');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('titleValue');
    this.args.term.title = this.title;
    return this.args.term.save();
  });

  @action
  revertTitleChanges() {
    this.removeErrorDisplayFor('titleValue');
    this.titleValue = this.args.term.title;
  }

  changeDescription = dropTask(async () => {
    this.args.term.set('description', this.description);
    await this.args.term.save();
  });

  @action
  revertDescriptionChanges() {
    this.descriptionValue = this.args.term.description;
  }

  @action
  async createTerm(title) {
    const term = this.store.createRecord('term', {
      title,
      parent: this.args.term,
      vocabulary: this.args.vocabulary,
      active: true,
    });
    this.newTerm = await term.save();
  }

  deleteTerm = dropTask(async () => {
    const parent = await this.args.term.parent;
    const goTo = isEmpty(parent) ? null : parent.id;
    this.args.term.deleteRecord();
    if (parent) {
      const siblings = await parent.children;
      siblings.splice(siblings.indexOf(this.args.term), 1);
      parent.set('children', siblings);
    }
    await this.args.term.save();
    this.args.manageTerm(goTo);
    this.flashMessages.success('general.successfullyRemovedTerm');
  });

  @action
  clearVocabAndTerm() {
    this.args.manageVocabulary(null);
    this.args.manageTerm(null);
  }

  changeIsActive = dropTask(async (isActive) => {
    this.args.term.active = isActive;
    await this.args.term.save();
  });

  async validateTitleCallback() {
    const terms = await this.args.term.children;
    return !mapBy(terms, 'title').includes(this.title);
  }

  validateTitleMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.term') });
  }
}
