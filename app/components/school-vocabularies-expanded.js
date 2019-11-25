import Component from '@ember/component';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

export default Component.extend({
  store: service(),

  classNames: ['school-vocabularies-expanded'],
  tagName: 'section',

  canCreateTerm: false,
  canCreateVocabulary: false,
  canDeleteTerm: false,
  canDeleteVocabulary: false,
  canUpdateTerm: false,
  canUpdateVocabulary: false,
  managedTerm: null,
  managedTermId: null,
  managedVocabulary: null,
  managedVocabularyId: null,
  school: null,

  isManaging: notEmpty('managedVocabulary'),

  showCollapsible: computed('isManaging', 'school.vocabularies.length', function() {
    const isManaging = this.isManaging;
    const school = this.school;
    const competencyIds = school.hasMany('vocabularies').ids();
    return competencyIds.length && ! isManaging;
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const managedVocabularyId = this.managedVocabularyId;
    const managedTermId = this.managedTermId;
    if(isPresent(managedVocabularyId)){
      this.get('school.vocabularies').then(vocabularies => {
        const managedVocabulary = vocabularies.findBy('id', managedVocabularyId);
        this.set('managedVocabulary', managedVocabulary);
        if(isPresent(managedTermId)){
          managedVocabulary.get('terms').then(terms => {
            const managedTerm = terms.findBy('id', managedTermId);
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
    collapse() {
      const collapse = this.collapse;
      const setSchoolManagedVocabulary = this.setSchoolManagedVocabulary;
      const setSchoolManagedVocabularyTerm = this.setSchoolManagedVocabularyTerm;
      this.get('school.vocabularies').then(vocabularies => {
        if(vocabularies.get('length')){
          collapse();
          setSchoolManagedVocabulary(null);
          setSchoolManagedVocabularyTerm(null);
        }
      });
    },

    cancel() {
      const setSchoolManagedVocabulary = this.setSchoolManagedVocabulary;
      setSchoolManagedVocabulary(null);
      this.set('bufferedTerms', []);
    }
  }
});
