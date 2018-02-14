/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
const { sort } = computed;

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
  }
});
