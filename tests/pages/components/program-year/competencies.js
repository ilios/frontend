import { clickable, collection, create, isPresent, text } from 'ember-cli-page-object';
import managedCompetencyListItem from './managed-competency-list-item';
import competencyListItem from './competency-list-item';
import bigSaveCancelButtons from 'frontend/tests/pages/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-program-year-competencies]',
  title: text('[data-test-header] [data-test-title]'),
  clickTitle: clickable('[data-test-header] [data-test-title]'),
  manage: clickable('[data-test-actions] [data-test-manage]'),
  canManage: isPresent('[data-test-actions] [data-test-manage]'),
  bigSaveCancelButtons,
  list: {
    scope: '[data-test-list]',
    domains: collection('[data-test-program-year-competency-list-item]', competencyListItem),
  },
  manager: {
    scope: '[data-test-managed-list]',
    domains: collection(
      '[data-test-program-year-managed-competency-list-item]',
      managedCompetencyListItem,
    ),
  },
};

export default definition;
export const component = create(definition);
