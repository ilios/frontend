import { clickable, create, isPresent, fillable, text } from 'ember-cli-page-object';
import schoolLeadershipExpanded from './school-leadership-expanded';
import schoolCompetenciesExpanded from './school-competencies-expanded';
import schoolCompetenciesCollapsed from './school-competencies-collapsed';
import schoolVocabulariesExpanded from './school-vocabularies-expanded';
import schoolVocabulariesCollapsed from './school-vocabularies-collapsed';
import schoolSessionTypesExpanded from './school-session-types-expanded';
import schoolSessionTypesCollapsed from './school-session-types-collapsed';
import schoolSessionAttributes from './school-session-attributes';
import schoolCurriculumInventoryInstitutionManager from './school-curriculum-inventory-institution-manager';
import schoolCurriculumInventoryInstitutionDetails from './school-curriculum-inventory-institution-details';
import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';

const definition = {
  scope: '[data-test-school-manager]',
  title: text('[data-test-school-title]'),
  editTitle: clickable('[data-test-school-title] .clickable'),
  changeTitle: fillable('[data-test-school-title] input'),
  saveTitle: clickable('[data-test-school-title] .done'),
  hasError: isPresent('[data-test-school-title] .validation-error-message'),
  errorMessage: text('[data-test-school-title] .validation-error-message'),
  schoolLeadershipExpanded,
  leadershipCollapsed,
  schoolCompetenciesExpanded,
  schoolCompetenciesCollapsed,
  schoolVocabulariesExpanded,
  schoolVocabulariesCollapsed,
  schoolSessionTypesExpanded,
  schoolSessionTypesCollapsed,
  schoolSessionAttributes,
  schoolCurriculumInventoryInstitutionManager,
  schoolCurriculumInventoryInstitutionDetails
};

export default definition;
export const component = create(definition);
