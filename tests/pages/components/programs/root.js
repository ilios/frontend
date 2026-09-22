import {
  clickable,
  create,
  collection,
  fillable,
  isVisible,
  text,
  value,
} from 'ember-cli-page-object';
import list from './list';
import newProgramForm from '../program/new';

const definition = {
  scope: '[data-test-programs]',
  schoolFilter: {
    scope: '[data-test-school-filter]',
    schools: collection('option'),
    select: fillable('select'),
    selectedSchool: value('select'),
  },
  headerTitle: text('h2'),
  toggleNewProgramForm: clickable('[data-test-expand-collapse-button] button'),
  toggleNewProgramFormExists: isVisible('[data-test-expand-collapse-button]'),
  list,
  newProgramForm,
};

export default definition;
export const component = create(definition);
