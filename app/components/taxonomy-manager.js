import Ember from 'ember';

const { Component, computed, isPresent, RSVP } = Ember;
const { Promise } = RSVP;
const { sort } = computed;

export default Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
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
  termsSorting: [
    'vocabulary.school.title',
    'vocabulary.title',
    //'titleWithParentTitles.content', // @todo does not work, sorting on 'title instead. Revisit [ST 2016/02/19]
    'title',
  ],

  /**
   * All currently selected terms, in sort order.
   * @property sortedTerms
   * @type {Ember.computed}
   * @public
   */
  sortedTerms: sort('selectedTerms', 'termsSorting'),

  /**
   * The currently selected vocabulary, defaults to the first assignable vocabulary if no user selection was made.
   * @property selectedVocabulary
   * @type {Ember.computed}
   * @public
   */
  selectedVocabulary: computed('subject.assignableVocabularies.[]', 'vocabId', function(){
    return new Promise(resolve => {
      this.get('subject.assignableVocabularies').then(vocabs => {
        if(isPresent(this.get('vocabId'))){
          let vocab = vocabs.find(v => {
            return v.get('id') === this.get('vocabId');
          });
          if(vocab){
            resolve(vocab);
          }
        }
        resolve(vocabs.get('firstObject'));
      });
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
  }
});
