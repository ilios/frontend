import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  text,
  triggerable,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-session]',
  title: {
    scope: '[data-test-title]',
    set: fillable(),
    submit: triggerable('keydown', '', { eventProperties: { key: 'Enter' } }),
  },
  sessionTypes: collection('[data-test-session-type]', {
    title: text(),
  }),
  selectSessionType: fillable('[data-test-session-types]'),
  hasError: isPresent('.validation-error-message'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
