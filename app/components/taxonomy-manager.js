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
    vocabularies: alias('subject.associatedVocabularies'),
    classNames: ['detail-taxonomies'],
    selectedTerms: [],
    tagName: 'section',
    termsSorting: [
        'vocabulary.school.title',
        'vocabulary.title',
        //'titleWithParentTitles.content', // @todo does not work, sorting on 'title instead. Revisit [ST 2016/02/19]
        'title',
    ],
    sortedTerms: sort('selectedTerms', 'termsSorting'),

    actions: {
        add: function(term){
            this.sendAction('add', term);
        },
        remove: function(term){
            this.sendAction('remove', term);
        }
    }
});
