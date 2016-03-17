import Ember from 'ember';

const { Component, computed, RSVP, isPresent, inject } = Ember;
const { Promise } = RSVP;
const { notEmpty } = computed;
const { service } = inject;

export default Component.extend({
  store: service(),
  school: null,
  managedVocabularyId: null,
  managedVocabulary: null,
  isManaging: notEmpty('managedVocabulary'),
  showCollapsible: computed('isManaging', 'school.vocabularies.length', function(){
    return new Promise(resolve => {
      const isManaging = this.get('isManaging');
      this.get('school.vocabularies').then(vocabularies => {
        resolve(vocabularies.get('length') && ! isManaging)
      });
    });

  }),
  didReceiveAttrs(){
    this._super(...arguments);
    const managedVocabularyId = this.get('managedVocabularyId');
    if(isPresent(managedVocabularyId)){
      this.get('school.vocabularies').then(vocabularies => {
        let managedVocabulary = vocabularies.findBy('id', managedVocabularyId);
        this.set('managedVocabulary', managedVocabulary);
      })
    } else {
      this.set('managedVocabulary', null);
    }
  },
  actions: {
    collapse(){
      this.get('school.vocabularies').then(vocabularies => {
        if(vocabularies.get('length')){
          this.attrs.collapse();
          this.attrs.setSchoolManagedVocabulary(null);
        }
      });
    },
    cancel(){
      this.attrs.setSchoolManagedVocabulary(null);
      this.set('bufferedTerms', []);
    },
  }
});
