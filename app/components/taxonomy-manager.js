import Ember from 'ember';
import scrollTo from '../utils/scroll-to';
import config from 'ilios/config/environment';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { alias, sort } = computed;

export default Component.extend({
    store: service(),
    i18n: service(),
    flashMessages: service(),
    subject: null,
    terms:  alias('subject.terms'),
    vocabularies: alias('subject.associatedVocabularies'),
    classNames: ['detail-taxonomies'],
    tagName: 'section',
    termsSorting: [
        'vocabulary.school.title',
        'vocabulary.title',
        'title',
    ],
    sortedTerms: sort('terms', 'termsSorting'),
});
