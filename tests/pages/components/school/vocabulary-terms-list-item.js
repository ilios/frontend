import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import newSubTermForm from './vocabulary-new-sub-term';
import editTermForm from './vocabulary-edit-term';

const definition = {
  scope: '[data-test-school-vocabulary-terms-list-item]',
  title: text('[data-test-title]'),
  isLabeledAsInactive: isPresent('[data-test-inactive]'),
  click: clickable(),
  hasEditTermForm: isPresent(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-school-vocabulary-edit-term]',
    { resetScope: true },
  ),
  editTermForm,
  hasNewTermForm: isPresent(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-school-vocabulary-new-term]',
    { resetScope: true },
  ),
  newSubTermForm,
  hasConfirmRemoval: isPresent(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-confirm-removal]',
    { resetScope: true },
  ),
  confirmRemoval: clickable(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-confirm-removal] [data-test-confirm-removal-confirm]',
    { resetScope: true },
  ),
  cancelRemoval: clickable(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-confirm-removal] [data-test-confirm-removal-cancel]',
    { resetScope: true },
  ),
};

export default definition;
export const component = create(definition);
