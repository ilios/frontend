import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  isVisible,
  property,
  text,
  value,
} from 'ember-cli-page-object';
import { flatpickrDatePicker } from 'ilios-common';

const definition = {
  scope: '[data-test-curriculum-inventory-report-overview]',
  title: text('[data-test-title]'),
  verificationPreviewLink: {
    scope: '[data-test-transition-to-verification-preview]',
  },
  rolloverLink: {
    scope: '[data-test-transition-to-rollover]',
  },
  startDate: {
    scope: '[data-test-start-date]',
    label: text('label'),
    text: text('.editinplace'),
    edit: clickable('.editinplace [data-test-edit]'),
    set: flatpickrDatePicker('input'),
    value: value('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
    readOnlyText: text('span'),
    isEditable: isPresent('.editinplace'),
  },
  endDate: {
    scope: '[data-test-end-date]',
    label: text('label'),
    text: text('.editinplace'),
    edit: clickable('.editinplace [data-test-edit]'),
    set: flatpickrDatePicker('input'),
    value: value('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
    readOnlyText: text('span'),
    isEditable: isPresent('.editinplace'),
  },
  academicYear: {
    scope: '[data-test-academic-year]',
    label: text('label'),
    text: text('.editinplace'),
    edit: clickable('.editinplace [data-test-edit]'),
    options: collection('select option', {
      isSelected: property('selected'),
    }),
    select: fillable('select'),
    value: value('select'),
    save: clickable('.done'),
    readOnlyText: text('span'),
    isEditable: isPresent('.editinplace'),
  },
  program: {
    scope: '[data-test-program]',
    label: text('label'),
    text: text('span'),
  },
  description: {
    scope: '[data-test-description]',
    label: text('label'),
    text: text('.editinplace'),
    edit: clickable('.editinplace [data-test-edit]'),
    set: fillable('textarea'),
    value: text('textarea'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
    readOnlyText: text('span'),
    isEditable: isPresent('.editinplace'),
  },
};

export default definition;
export const component = create(definition);
