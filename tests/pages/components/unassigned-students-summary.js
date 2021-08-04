import { create, collection, isPresent, hasClass, text, value } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-unassigned-students-summary]',
  title: text('[data-test-title]'),
  summaryText: text('[data-test-summary-text]'),
  hasManageLink: isPresent('[data-test-manage-link]'),
  hasAlert: hasClass('alert'),
  schools: collection('[data-test-schools] select option'),
  selectedSchool: value('[data-test-schools] select option:selected'),
  singleSelectedSchool: text('[data-test-schools]'),
  hasMultipleSchools: isPresent('[data-test-schools] select'),
};

export default definition;
export const component = create(definition);
