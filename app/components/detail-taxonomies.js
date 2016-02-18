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
    termsWithAllParents: alias('subject.termsWithAllParents'),
    classNames: ['detail-taxonomies'],
    isCourse: false,
    isSession: false,
    isProgramYear: false,
    isManaging: false,
    editable: true,

    showCollapsible: computed('isManaging', 'terms', function(){
        const isManaging = this.get('isManaging');
        const terms = this.get('terms');
        return terms.get('length') && ! isManaging;
    }),

    termsSorting: [
        'vocabulary.school.title',
        'vocabulary.title',
        'title',
    ],
    sortedTerms: sort('terms', 'termsSorting'),

    actions: {
        collapse(){
            this.get('terms').then(terms => {
                if(terms.length){
                    this.attrs.collapse();
                }
            });
        },
    }
});
