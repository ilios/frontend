import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend({
  store: service(),
  i18n: service(),
  flashMessages: service(),
  subject: null,
  bufferedTerms: [],
  terms: alias('subject.terms'),
  vocabularies: alias('subject.associatedVocabularies'),
  classNames: ['taxonomy-manager'],
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  isManaging: false,
  editable: true,

  showCollapsible: computed('isManaging', 'terms', function () {
    const isManaging = this.get('isManaging');
    const terms = this.get('terms');
    return terms.get('length') && !isManaging;
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
        if (terms.length) {
          this.attrs.collapse();
        }
      });
    },
    save: function () {
      let subject = this.get('subject');
      let terms = subject.get('terms');
      let promises = [];
      terms.clear();
      terms.addObjects(this.get('bufferedTerms'));
      this.get('bufferedTerms').forEach((term)=> {
        if (this.get('isCourse')) {
          term.get('courses').addObject(subject);
        } else if (this.get('isSession')) {
          term.get('sessions').addObject(subject);
        } else if (this.get('isProgramYear')) {
          term.get('programYears').addObject(subject);
        }
      });
      promises.pushObject(subject.save());
      Ember.RSVP.all(promises).then(()=> {
        this.set('isManaging', false);
      });
    },
    cancel: function () {
      this.set('bufferedTerms', []);
      this.set('isManaging', false);
    },
    addTermToBuffer: function (term) {
      this.get('bufferedTerms').addObject(term);
    },
    removeTermFromBuffer: function (term) {
      this.get('bufferedTerms').removeObject(term);
    }
  }
});
