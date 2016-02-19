import Ember from 'ember';

const { Component, computed } = Ember;
const { sort } = computed;

export default Component.extend({
    vocabulary: null,
    terms: null,
    classNames: ['detail-taxonomies'],

    termsSorting: [
        'title',
    ],

    sortedTerms: sort('filteredTerms', 'termsSorting'),

    filteredTerms: computed('terms.[]', 'vocabulary', function() {
        let terms = this.get('terms');
        let vocab = this.get('vocabulary');
        let filteredTerms = [];
        terms.forEach((term) => {
            if (term.get('vocabulary.id') === vocab.get('id')) {
                filteredTerms.push(term);
            }
        });

        return filteredTerms;
    }),
});
