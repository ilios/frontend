import {
  clickable,
  collection,
  create,
  fillable,
  isVisible,
  property,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';

import clickChoiceButtons from 'ilios-common/page-objects/components/click-choice-buttons';

const definition = {
  scope: '[data-test-new-directory-user]',
  search: {
    scope: '[data-test-search]',
    set: fillable('input[type="search"]'),
    value: value('input[type="search"]'),
    submit: clickable('[data-test-submit]'),
    submitOnEnter: triggerable('keyup', 'input[type="search"]', {
      eventProperties: { key: 'Enter' },
    }),
  },
  searchResults: collection('[data-test-search-result]', {
    addUser: clickable('[data-test-add]'),
    userAlreadyExists: isVisible('[data-test-view]'),
    viewUser: clickable('[data-test-view]'),
    userCannotBeAdded: isVisible('[data-test-cannot-be-added]'),
    userCanBeAdded: isVisible('[data-test-add]'),
    name: text('[data-test-name]'),
    campusId: text('[data-test-campus-id]'),
    email: text('[data-test-email]'),
  }),
  form: {
    scope: '[data-test-form]',
    clickChoiceButtons,
    firstName: text('[data-test-first-name]'),
    middleName: text('[data-test-middle-name]'),
    lastName: text('[data-test-last-name]'),
    campusId: text('[data-test-campus-id]'),
    otherId: text('[data-test-other-id]'),
    email: text('[data-test-email]'),
    phone: text('[data-test-phone]'),
    username: {
      scope: '[data-test-username]',
      label: text('label'),
      set: fillable('input'),
      value: value('input'),
      hasError: isVisible('.validation-error-message'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    password: {
      scope: '[data-test-password]',
      set: fillable('input'),
      value: value('input'),
      hasError: isVisible('.validation-error-message'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    school: {
      scope: '[data-test-school] select',
      select: fillable(),
      options: collection('option', {
        selected: property('selected'),
      }),
    },
    cohort: {
      scope: '[data-test-cohort] select',
      select: fillable(),
      options: collection('option', {
        selected: property('selected'),
      }),
    },
    submit: clickable('[data-test-submit]'),
    cancel: clickable(['[data-test-cancel]']),
  },
};

export default definition;
export const component = create(definition);
