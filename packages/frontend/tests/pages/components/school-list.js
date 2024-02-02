import {
  attribute,
  clickable,
  collection,
  create,
  isVisible,
  fillable,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-list]',
  expandCollapseButton: {
    scope: '[data-test-expand-collapse-button]',
    toggle: clickable('button'),
  },
  newSchoolForm: {
    scope: '[data-test-new-school-form]',
    title: {
      scope: '[data-test-title]',
      set: fillable('input'),
      value: value('input'),
      hasError: isVisible('.validation-error-message'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    email: {
      scope: '[data-test-email]',
      set: fillable('input'),
      value: value('input'),
      hasError: isVisible('.validation-error-message'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    submit: clickable('[data-test-submit]'),
    cancel: clickable('[data-test-cancel]'),
  },
  savedSchool: {
    scope: '[data-test-new-school]',
    link: attribute('href', 'a'),
  },
  schools: collection('[data-test-school]', {
    title: text('[data-test-title]'),
    titleLink: attribute('href', '[data-test-title] a'),
  }),
};

export default definition;
export const component = create(definition);
