import { clickable, create, isPresent, fillable, text } from 'ember-cli-page-object';
import competenciesCollapsed from './competencies-collapsed';
import competenciesExpanded from './competencies-expanded';
import emails from './emails';
import emailsEditor from './emails-editor';
import institutionalInformationDetails from './institutional-information-details';
import institutionalInformationManager from './institutional-information-manager';
import learningMaterialAttributes from './learning-material-attributes';
import sessionAttributes from './session-attributes';
import sessionTypesCollapsed from './session-types-collapsed';
import sessionTypesExpanded from './session-types-expanded';
import vocabulariesCollapsed from './vocabularies-collapsed';
import vocabulariesExpanded from './vocabularies-expanded';
import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import leadershipExpanded from 'ilios-common/page-objects/components/leadership-expanded';

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
  leadershipExpanded,
  leadershipCollapsed,
  competenciesExpanded,
  competenciesCollapsed,
  vocabulariesExpanded,
  vocabulariesCollapsed,
  sessionTypesExpanded,
  sessionTypesCollapsed,
  sessionAttributes,
  learningMaterialAttributes,
  institutionalInformationDetails,
  institutionalInformationManager,
  emails,
  emailsEditor,
};

export default definition;
export const component = create(definition);
