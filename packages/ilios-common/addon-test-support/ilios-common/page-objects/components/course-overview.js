import {
  attribute,
  create,
  clickable,
  fillable,
  text,
  isVisible,
  value,
} from 'ember-cli-page-object';
import datePicker from './date-picker';

const definition = {
  scope: '[data-test-course-overview]',
  rollover: {
    scope: 'a.rollover',
    visit: clickable(),
    link: attribute('href'),
    visible: isVisible(),
  },
  externalId: {
    scope: '.courseexternalid',
    value: value('input'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  startDate: {
    scope: '.coursestartdate',
    edit: clickable('[data-test-edit]'),
    datePicker,
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  endDate: {
    scope: '.courseenddate',
    value: value('input'),
    edit: clickable('[data-test-edit]'),
    datePicker,
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  level: {
    scope: '.courselevel',
    value: value('select'),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  universalLocator: text('.universallocator'),
  clerkshipType: {
    scope: '.clerkshiptype',
    value: value('select'),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
  },
};

export default definition;
export const component = create(definition);
