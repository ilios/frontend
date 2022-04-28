import { clickable, create, property, text } from 'ember-cli-page-object';
import yesNo from './yes-no';

const definition = {
  scope: '[data-test-user-profile-roles]',
  save: {
    scope: '[data-test-save]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
  manage: {
    scope: '[data-test-manage]',
  },
  student: {
    scope: '[data-test-student]',
    label: text('label'),
    value: text('.value'),
  },
  formerStudent: {
    scope: '[data-test-former-student]',
    label: text('label'),
    value: text('.value'),
    check: clickable('input'),
    isChecked: property('checked', 'input'),
  },
  enabled: {
    scope: '[data-test-enabled]',
    label: text('label'),
    value: text('.value'),
    check: clickable('input'),
    isChecked: property('checked', 'input'),
  },
  excludeFromSync: {
    scope: '[data-test-exclude-from-sync]',
    label: text('label'),
    value: text('.value'),
    check: clickable('input'),
    isChecked: property('checked', 'input'),
  },
  performsNonLearnerFunction: {
    scope: '[data-test-performs-non-learner-function]',
    label: text('label'),
    yesNo,
  },
  learner: {
    scope: '[data-test-learner]',
    label: text('label'),
    yesNo,
  },
  root: {
    scope: '[data-test-root]',
    label: text('label'),
    yesNo,
  },
};

export default definition;
export const component = create(definition);
