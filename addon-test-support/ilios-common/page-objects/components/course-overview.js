import {
  create,
  clickable,
  fillable,
  text,
  isVisible,
} from 'ember-cli-page-object';
import { datePicker } from 'ilios-common';

const definition = {
  scope: '[data-test-course-overview]',
  rollover: {
    scope: 'span.rollover',
    visit: clickable(),
    visible: isVisible()
  },
  externalId: {
    scope: '.courseexternalid',
    value: text('span', { at: 0}),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message')
  },
  startDate: {
    scope: '.coursestartdate',
    value: text('span', { at: 0}),
    edit: clickable('[data-test-edit]'),
    set: datePicker('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message')
  },
  endDate: {
    scope: '.courseenddate',
    value: text('span', { at: 0}),
    edit: clickable('[data-test-edit]'),
    set: datePicker('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message')
  },
  level: {
    scope: '.courselevel',
    value: text('span', { at: 0}),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message')
  },
  universalLocator: text('.universallocator'),
  clerkshipType: {
    scope: '.clerkshiptype',
    value: text('span', { at: 0}),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done')
  },
};

export default definition;
export const component = create(definition);
