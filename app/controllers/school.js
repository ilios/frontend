import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  queryParams: [
    'schoolCompetencyDetails',
    'schoolManageCompetencies',
    'schoolVocabularyDetails',
    'schoolManageVocabularies',
  ],
  schoolCompetencyDetails: false,
  schoolManageCompetencies: false,
  schoolVocabularyDetails: false,
  schoolManageVocabularies: false,
});
