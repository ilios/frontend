import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  school: null,
  isManaging: false,
  bufferedVocabularies: null,
  showCollapsible: computed('isManaging', 'school.vocabularies.length', function(){
    const isManaging = this.get('isManaging');
    const vocabularies = this.get('school.vocabularies');
    return vocabularies.get('length') && ! isManaging;
  }),
  actions: {
    collapse(){
      this.get('school.vocabularies').then(vocabularies => {
        if(vocabularies.length){
          this.attrs.collapse();
        }
      });
    },
  }
});
