import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

export default class TaxonomyManager extends Component {
  @service store;
  @service intl;
  @service flashMessages;
  @tracked termFilter = '';
  @tracked vocabId = null;

  @action
  load(element, [vocabulary]) {
    if (vocabulary) {
      this.vocabId = vocabulary.id;
    }
  }

  get nonEmptyVocabularies() {
    if (!this.args.vocabularies) {
      return [];
    } else {
      return this.args.vocabularies.slice().filter((vocab) => {
        return vocab.get('termCount') > 0;
      });
    }
  }

  get assignableVocabularies() {
    return this.nonEmptyVocabularies.filter((vocab) => {
      return vocab.get('active');
    });
  }

  get listableVocabularies() {
    return this.nonEmptyVocabularies.filter((vocab) => {
      if (vocab.get('active')) {
        return true;
      }
      const terms = this.args.selectedTerms;
      const vocabId = vocab.get('id');
      let hasTerms = false;
      terms.forEach((term) => {
        if (term.belongsTo('vocabulary').id() === vocabId) {
          hasTerms = true;
        }
      });

      return hasTerms;
    });
  }

  get selectedVocabulary() {
    if (isPresent(this.vocabId)) {
      const vocab = this.assignableVocabularies.find((v) => {
        return v.get('id') === this.vocabId;
      });
      if (vocab) {
        return vocab;
      }
    }
    return this.assignableVocabularies[0];
  }

  @action
  changeSelectedVocabulary(event) {
    this.vocabId = event.target.value;
  }

  setTermFilter = restartableTask(async (termFilter) => {
    const clean = escapeRegExp(termFilter);
    if (isPresent(clean)) {
      await timeout(250);
    }
    this.termFilter = clean;
  });
}
