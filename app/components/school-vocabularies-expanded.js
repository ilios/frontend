import Ember from 'ember';

const { Component, computed, RSVP } = Ember;
const { Promise } = RSVP;

export default Component.extend({
  school: null,
  isManaging: false,
  bufferedVocabularies: null,
  showCollapsible: computed('isManaging', 'school.vocabularies.length', function(){
    return new Promise(resolve => {
      const isManaging = this.get('isManaging');
      this.get('school.vocabularies').then(vocabularies => {
        resolve(vocabularies.get('length') && ! isManaging)
      });
    });

  }),
  actions: {
    collapse(){
      this.get('school.vocabularies').then(vocabularies => {
        if(vocabularies.get('length')){
          this.attrs.collapse();
        }
      });
    },
  }
});
