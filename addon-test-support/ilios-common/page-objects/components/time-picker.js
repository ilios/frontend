import { collection, create, fillable, value } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-time-picker]',
  hour: {
    scope: '[data-test-hour]',
    select: fillable(),
    value: value(),
    options: collection('option'),
  },
  minute: {
    scope: '[data-test-minute]',
    select: fillable(),
    value: value(),
    options: collection('option'),
  },
  ampm: {
    scope: '[data-test-ampm]',
    select: fillable(),
    value: value(),
    options: collection('option'),
  },
};

export default definition;
export const component = create(definition);
