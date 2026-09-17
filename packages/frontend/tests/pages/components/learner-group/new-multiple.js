import { create, fillable, isVisible, isPresent, text, value } from 'ember-cli-page-object';
import bigSaveCancelButtons from 'ilios-common/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-learner-group-new-multiple]',
  bigSaveCancelButtons,
  isVisible: isVisible(),
  set: fillable('input'),
  value: value('input'),
  hasError: isPresent('[data-test-number-of-groups-validation-error-message]'),
  error: text('[data-test-number-of-groups-validation-error-message]'),
};

export default definition;
export const component = create(definition);
