import {
  clickable,
  create,
  collection,
  fillable,
  isVisible,
  isPresent,
  text,
  value,
} from 'ember-cli-page-object';
import list from '../learner-group/list';
import newLearnerGroupForm from '../learner-group/new';

const definition = {
  scope: '[data-test-learner-groups]',
  schoolFilter: {
    scope: '[data-test-school-filter]',
    schools: collection('option'),
    select: fillable('select'),
    selectedSchool: value('select'),
    hasMany: isPresent('select'),
  },
  programFilter: {
    scope: '[data-test-program-filter]',
    programs: collection('option'),
    select: fillable('select'),
    selectedProgram: value('select'),
    hasMany: isPresent('select'),
  },
  programYearFilter: {
    scope: '[data-test-program-year-filter]',
    programYears: collection('option'),
    select: fillable('select'),
    selectedProgramYear: value('select'),
    hasMany: isPresent('select'),
  },
  setTitleFilter: fillable('[data-test-title-filter] input'),
  headerTitle: text('h2'),
  toggleNewLearnerGroupForm: clickable('[data-test-expand-collapse-button] button'),
  toggleNewLearnerGroupFormExists: isVisible('[data-test-expand-collapse-button]'),
  list,
  newLearnerGroupForm,
  savedResult: text('.saved-result'),
  emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
};

export default definition;
export const component = create(definition);
