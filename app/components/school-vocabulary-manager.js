import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { validatable, Custom, Length, NotBlank } from 'ilios-common/decorators/validation';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

@validatable
export default class SchoolVocabularyManagerComponent extends Component {
  @service store;
  @service intl;
  @tracked
  @NotBlank()
  @Length(1, 200)
  @Custom('validateTitleCallback', 'validateTitleMessageCallback')
  title;
  @tracked isActive = false;
  @tracked newTerm;
  @use terms = new ResolveAsyncValue(() => [this.args.vocabulary.terms]);

  get sortedTerms() {
    if (!this.terms) {
      return [];
    }
    return sortBy(
      filterBy(
        filterBy(filterBy(this.terms.slice(), 'isTopLevel'), 'isNew', false),
        'isDeleted',
        false
      ),
      'title'
    );
  }

  @action
  load() {
    this.title = this.args.vocabulary.title;
    this.isActive = this.args.vocabulary.active;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.vocabulary.title = this.title;
    yield this.args.vocabulary.save();
  }

  @action
  revertTitleChanges() {
    this.removeErrorDisplayFor('title');
    this.title = this.args.vocabulary.title;
  }

  @action
  async createTerm(title) {
    const term = this.store.createRecord('term', {
      title: title,
      vocabulary: this.args.vocabulary,
      active: true,
    });
    this.newTerm = await term.save();
  }

  async validateTitleCallback() {
    const school = await this.args.vocabulary.school;
    const allVocabsInSchool = await school.vocabularies;
    const siblings = allVocabsInSchool.slice().filter((vocab) => {
      return vocab !== this.args.vocabulary;
    });
    const siblingTitles = siblings.mapBy('title');
    return !siblingTitles.includes(this.title);
  }

  validateTitleMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.vocabulary') });
  }
}
