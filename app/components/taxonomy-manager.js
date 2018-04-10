/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
const { sort } = computed;
import escapeRegExp from '../utils/escape-reg-exp';

export default Component.extend({
  store: service(),
  i18n: service(),
  flashMessages: service(),
  init() {
    this._super(...arguments);
    this.set('termsSorting', [
      'vocabulary.school.title',
      'vocabulary.title',
      //'titleWithParentTitles.content', // @todo does not work, sorting on 'title instead. Revisit [ST 2016/02/19]
      'title'
    ]);
  },
  subject: null,
  classNames: ['taxonomy-manager'],
  tagName: 'section',
  termFilter: '',

  /**
   * The ID of the currently selected vocabulary.
   *
   * @property vocabId
   * @type {int|null}
   * @public
   */
  vocabId: null,

  /**
   * Defines the sort order for currently associated terms.
   *
   * @property
   * @type {Array}
   * @public
   */
  termsSorting: null,

  /**
   * All currently selected terms, in sort order.
   * @property sortedTerms
   * @type {Ember.computed}
   * @public
   */
  sortedTerms: sort('selectedTerms', 'termsSorting'),

  /**
   * All vocabularies, excluding those without any terms.
   * @property nonEmptyVocabularies
   * @type {Ember.computed}
   * @public
   */
  nonEmptyVocabularies: computed('subject.assignableVocabularies.[]', async function(){
    const vocabularies = await this.get('subject.assignableVocabularies');
    return vocabularies.toArray().filter(vocab => {
      return (vocab.get('termCount') > 0);
    });
  }),

  /**
   * All non-empty vocabularies, excluding those that are inactive.
   * @property assignableVocabularies
   * @type {Ember.computed}
   * @public
   */
  assignableVocabularies: computed('nonEmptyVocabularies.[]', async function(){
    const vocabularies = await this.get('nonEmptyVocabularies');
    return vocabularies.toArray().filter(vocab => {
      return vocab.get('active');
    });
  }),

  /**
   * All non-empty vocabularies that are active, and all inactive vocabularies that have at least one selected term.
   * In other words, this excludes all inactive vocabularies that have no selected terms.
   *
   * @property listableVocabularies
   * @type {Ember.computed}
   * @public
   */
  listableVocabularies: computed('nonEmptyVocabularies.[]', 'selectedTerms.[]', async function() {
    const vocabularies = await this.get('nonEmptyVocabularies');
    return vocabularies.toArray().filter(vocab => {
      if (vocab.get('active')) {
        return true;
      }
      const terms = this.get('selectedTerms');
      const vocabId = vocab.get('id');
      let hasTerms = false;
      terms.forEach(term => {
        if (term.belongsTo('vocabulary').id() === vocabId) {
          hasTerms = true;
        }
      });

      return hasTerms;
    });
  }),

  /**
   * The currently selected vocabulary,
   * defaults to the first assignable vocabulary with terms if no user selection was made.
   * @property selectedVocabulary
   * @type {Ember.computed}
   * @public
   */
  selectedVocabulary: computed('assignableVocabularies.[]', 'vocabId', async function(){
    const vocabs = await this.get('assignableVocabularies');
    if(isPresent(this.get('vocabId'))){
      let vocab = vocabs.find(v => {
        return v.get('id') === this.get('vocabId');
      });
      if(vocab){
        return vocab;
      }
    }
    return vocabs.get('firstObject');
  }),

  /**
   * @property topLevelTerms
   * @type {Ember.computed}
   * @public
   */
  topLevelTerms: computed('selectedVocabulary', async function() {
    const vocabulary = await this.get('selectedVocabulary');
    return vocabulary.get('topLevelTerms');
  }),

  /**
   * @property filteredTerms
   * @type {Ember.computed}
   * @public
   */
  filteredTerms: computed('topLevelTerms.[]', 'termFilter', async function() {
    const termFilter = this.get('termFilter');
    const topLevelTerms = await this.get('topLevelTerms');
    if (isEmpty(termFilter)) {
      return topLevelTerms;
    }
    let exp = new RegExp(termFilter, 'gi');
    return filter(topLevelTerms.toArray(), async term => {
      const searchString = await term.get('titleWithDescendantTitles');
      return searchString.match(exp);
    });
  }),

  actions: {
    add(term) {
      this.sendAction('add', term);
    },
    remove(term) {
      this.sendAction('remove', term);
    },
    changeSelectedVocabulary(vocabId) {
      this.set('vocabId', vocabId);
    }
  },

  setTermFilter: task(function* (termFilter) {
    const clean = escapeRegExp(termFilter);
    if (isPresent(clean)) {
      yield timeout(250);
    }
    this.set('termFilter', clean);
  }).restartable(),
});
