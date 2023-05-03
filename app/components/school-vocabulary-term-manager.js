import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { validatable, Custom, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
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
  title = this.args.term.title;

  @tracked isActive = this.args.term.active;
  @tracked description = this.args.term.description;
  @tracked newTerm;

  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.term.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : null;
  }

  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.term.getAllParents());
  }

  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : null;
  }

  get isLoading() {
    return !this.children || !this.allParents;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.term.title = this.title;
    return this.args.term.save();
  }

  @action
  revertTitleChanges() {
    this.removeErrorDisplayFor('title');
    this.title = this.args.term.title;
  }

  @dropTask
  *changeDescription() {
    this.args.term.set('description', this.description);
    yield this.args.term.save();
  }

  @action
  revertDescriptionChanges() {
    this.description = this.args.term.description;
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

  @dropTask
  *deleteTerm() {
    const parent = yield this.args.term.parent;
    const goTo = isEmpty(parent) ? null : parent.id;
    this.args.term.deleteRecord();
    if (parent) {
      const siblings = (yield parent.children).slice();
      siblings.splice(siblings.indexOf(this.args.term), 1);
      parent.set('children', siblings);
    }
    yield this.args.term.save();
    this.args.manageTerm(goTo);
    this.flashMessages.success('general.successfullyRemovedTerm');
  }

  @action
  clearVocabAndTerm() {
    this.args.manageVocabulary(null);
    this.args.manageTerm(null);
  }

  @dropTask
  *changeIsActive(isActive) {
    this.args.term.active = isActive;
    yield this.args.term.save();
    this.isActive = this.args.term.active;
  }

  async validateTitleCallback() {
    const terms = await this.args.term.children;
    return !mapBy(terms.slice(), 'title').includes(this.title);
  }

  validateTitleMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.term') });
  }
}
