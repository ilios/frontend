import { clickable, create, isPresent, fillable, text } from 'ember-cli-page-object';
import schoolCompetenciesExpanded from './school-competencies-expanded';
import schoolCompetenciesCollapsed from './school-competencies-collapsed';
import schoolVocabulariesExpanded from './school-vocabularies-expanded';
import schoolVocabulariesCollapsed from './school-vocabularies-collapsed';
import schoolSessionTypesExpanded from './school-session-types-expanded';
import schoolSessionTypesCollapsed from './school-session-types-collapsed';
import schoolSessionAttributes from './school-session-attributes';
import schoolCurriculumInventoryInstitutionManager from './school-curriculum-inventory-institution-manager';
import schoolCurriculumInventoryInstitutionDetails from './school-curriculum-inventory-institution-details';
import schoolLeadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import schoolLeadershipExpanded from 'ilios-common/page-objects/components/leadership-expanded';
import emails from './school/emails';
import emailsEditor from './school/emails-editor';

const definition = {
  scope: '[data-test-school-manager]',
  title: {
    scope: '[data-test-school-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isPresent('[data-test-title-validation-error-message]'),
    errorMessage: text('[data-test-title-validation-error-message]'),
  },
  schoolLeadershipExpanded,
  schoolLeadershipCollapsed,
  schoolCompetenciesExpanded,
  schoolCompetenciesCollapsed,
  schoolVocabulariesExpanded,
  schoolVocabulariesCollapsed,
  schoolSessionTypesExpanded,
  schoolSessionTypesCollapsed,
  schoolSessionAttributes,
  schoolCurriculumInventoryInstitutionManager,
  schoolCurriculumInventoryInstitutionDetails,
  emails,
  emailsEditor,
};

export default definition;
export const component = create(definition);
