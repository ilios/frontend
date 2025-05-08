import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { TrackedAsyncData } from 'ember-async-data';
import { restartableTask, timeout } from 'ember-concurrency';
import { filter } from 'rsvp';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';

export default class TaxonomyManager extends Component {
  @service store;
  @service intl;
  @service flashMessages;
  @tracked termFilter = '';
  @tracked vocabulary = null;

  @cached
  get filteredTopLevelTermsData() {
    return new TrackedAsyncData(
      this.getFilteredTopLevelTermsFromSelectedVocabulary(this.selectedVocabulary, this.termFilter),
    );
  }

  get filteredTopLevelTerms() {
    return this.filteredTopLevelTermsData.isResolved ? this.filteredTopLevelTermsData.value : [];
  }

  async getFilteredTopLevelTermsFromSelectedVocabulary(vocabulary, termFilter) {
    if (!vocabulary) {
      return [];
    }
    const terms = await vocabulary.getTopLevelTerms();
    if (termFilter) {
      const exp = new RegExp(termFilter, 'gi');
      return await filter(terms, async (term) => {
        const searchString = await term.getTitleWithDescendantTitles();
        return searchString.match(exp);
      });
    }
    return terms;
  }

  get terms() {
    return this.filteredTopLevelTerms ?? [];
  }

  get nonEmptyVocabularies() {
    if (!this.args.vocabularies) {
      return [];
    } else {
      return this.args.vocabularies.filter((vocab) => {
        return vocab.termCount > 0;
      });
    }
  }

  @cached
  get assignableVocabulariesData() {
    return new TrackedAsyncData(this.getAssignableVocabularies(this.nonEmptyVocabularies));
  }

  get assignableVocabularies() {
    return this.assignableVocabulariesData.isResolved ? this.assignableVocabulariesData.value : [];
  }

  async getAssignableVocabularies(vocabularies) {
    // Filter out inactive vocabularies.
    const activeVocabularies = vocabularies.filter((vocab) => vocab.active);
    // Filter out vocabularies where all top-level terms are inactive.
    return filter(activeVocabularies, async (vocabulary) => {
      const topLevelTerms = await vocabulary.getTopLevelTerms();
      return !topLevelTerms.every((term) => !term.active);
    });
  }

  get listableVocabularies() {
    return this.nonEmptyVocabularies.filter((vocab) => {
      if (vocab.active) {
        return true;
      }
      const terms = this.args.selectedTerms;
      let hasTerms = false;
      terms.forEach((term) => {
        if (term.belongsTo('vocabulary').id() === vocab.id) {
          hasTerms = true;
        }
      });

      return hasTerms;
    });
  }

  get selectedVocabulary() {
    if (this.vocabulary) {
      return this.vocabulary;
    }
    if (this.args.vocabulary) {
      return this.args.vocabulary;
    }
    if (this.assignableVocabularies.length) {
      return this.assignableVocabularies[0];
    }
    return null;
  }

  get selectedVocabularyId() {
    return this.selectedVocabulary?.id;
  }

  @action
  changeSelectedVocabulary(event) {
    const vocabId = event.target.value;
    this.vocabulary = this.assignableVocabularies.find((v) => {
      return v.id === vocabId;
    });
  }

  setTermFilter = restartableTask(async (termFilter) => {
    const clean = escapeRegExp(termFilter);
    if (isPresent(clean)) {
      await timeout(250);
    }
    this.termFilter = clean;
  });
}
