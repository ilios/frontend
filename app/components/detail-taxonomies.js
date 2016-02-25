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
  classNames: ['taxonomy-manager'],
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  isManaging: false,
  isSaving: false,
  editable: true,

  showCollapsible: computed('isManaging', 'subject.terms.[]', function () {
    const isManaging = this.get('isManaging');
    const terms = this.get('subject.terms');
    return !isManaging && terms.get('length');
  }),

  actions: {
    manage(){
      this.attrs.expand();
      this.get('subject.terms').then(terms => {
        this.set('bufferedTerms', terms.toArray());
        this.set('isManaging', true);
      });
    },
    collapse(){
      this.get('subject.terms').then(terms => {
        if (terms.get('length')) {
          this.attrs.collapse();
        }
      });
    },
    save(){
      this.set('isSaving', true);
      let subject = this.get('subject');
      subject.get('terms').then(termsList => {
        termsList.clear();
        this.get('bufferedTerms').forEach(term=>{
          termsList.pushObject(term);
        });
        subject.save().then(()=>{
          this.set('bufferedTerms', []);
          this.set('isSaving', false);
          this.set('isManaging', false);
        });
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
