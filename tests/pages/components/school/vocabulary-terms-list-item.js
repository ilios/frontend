import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import newSubTermForm from './vocabulary-new-term';
import editTermForm from './vocabulary-edit-term';

const definition = {
  scope: '[data-test-school-vocabulary-terms-list-item]',
  title: text('[data-test-title]'),
  isLabeledAsInactive: isPresent('[data-test-inactive]'),
  click: clickable(),
  hasNewTermForm: isPresent(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-school-vocabulary-new-term]',
    { resetScope: true },
  ),
  newSubTermForm,
  hasEditTermForm: isPresent(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-school-vocabulary-edit-term]',
    { resetScope: true },
  ),
  editTermForm,
  hasConfirmRemoval: isPresent(
    '[data-test-school-vocabulary-terms-list-item] + [data-test-confirm-removal]',
    { resetScope: true },
  ),
  confirmRemoval: clickable('[data-test-confirm-removal-confirm]'),
  cancelRemoval: clickable('[data-test-confirm-removal-cancel]'),
};

export default definition;
export const component = create(definition);
