import Ember from 'ember';
import scrollTo from '../utils/scroll-to';
import config from 'ilios/config/environment';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend({
    store: service(),
    i18n: service(),
    flashMessages: service(),
    subject: null,
    bufferedTerms: [],
    terms:  alias('subject.terms'),
    vocabularies: alias('subject.associatedVocabularies'),
    classNames: ['taxonomy-manager'],
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

    actions: {
        manage(){
            this.get('subject.terms').then(terms => {
                this.set('bufferedTerms', terms.toArray());
                this.set('isManaging', true);
            });
        },
        collapse(){
            this.get('terms').then(terms => {
                if(terms.length){
                    this.attrs.collapse();
                }
            });
        },
    }
});
