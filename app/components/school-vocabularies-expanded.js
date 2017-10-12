import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
const { Promise } = RSVP;
const { notEmpty } = computed;

export default Component.extend({
  store: service(),
  school: null,
  tagName: 'section',
  classNames: ['school-vocabularies-expanded'],
  managedVocabularyId: null,
  managedTermId: null,
  managedVocabulary: null,
  managedTerm: null,
  isManaging: notEmpty('managedVocabulary'),
  showCollapsible: computed('isManaging', 'school.vocabularies.length', function(){
    return new Promise(resolve => {
      const isManaging = this.get('isManaging');
      this.get('school.vocabularies').then(vocabularies => {
        resolve(vocabularies.get('length') && ! isManaging);
      });
    });

  }),
  didReceiveAttrs(){
    this._super(...arguments);
    const managedVocabularyId = this.get('managedVocabularyId');
    const managedTermId = this.get('managedTermId');
    if(isPresent(managedVocabularyId)){
      this.get('school.vocabularies').then(vocabularies => {
        let managedVocabulary = vocabularies.findBy('id', managedVocabularyId);
        this.set('managedVocabulary', managedVocabulary);
        if(isPresent(managedTermId)){
          managedVocabulary.get('terms').then(terms => {
            let managedTerm = terms.findBy('id', managedTermId);
            this.set('managedTerm', managedTerm);
          });
        } else {
          this.set('managedTerm', null);
        }
      });
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
          this.attrs.setSchoolManagedVocabularyTerm(null);
        }
      });
    },
    cancel(){
      this.attrs.setSchoolManagedVocabulary(null);
      this.set('bufferedTerms', []);
    },
  }
});
