import {
  collection,
  clickable,
  create,
  fillable,
  hasClass,
  isVisible,
  property,
  text,
  value,
} from 'ember-cli-page-object';

import durationEditor from './sequence-block-dates-duration-editor';
import sessionManager from './sequence-block-session-manager';
import sessionList from './sequence-block-session-list';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-overview]',
  overview: {
    scope: '[data-test-overview]',
    title: text('[data-test-title]'),
    course: {
      scope: '[data-test-course]',
      label: text('label'),
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      value: value('select'),
      select: fillable('select'),
      options: collection('option', {
        isSelected: property('selected'),
      }),
      details: text('[data-test-course-details]'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    courseDetails: {
      scope: '[data-test-course-details]',
    },
    description: {
      scope: '[data-test-description]',
      label: text('label'),
      edit: clickable('.editinplace [data-test-edit]'),
      set: fillable('textarea'),
      value: text('textarea'),
      isEditable: isVisible('.editinplace'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    required: {
      scope: '[data-test-required]',
      label: text('label'),
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      value: value('select'),
      select: fillable('select'),
      options: collection('option', {
        isSelected: property('selected'),
      }),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    academicLevel: {
      scope: '[data-test-academic-level]',
      label: text('label'),
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      value: value('select'),
      select: fillable('select'),
      options: collection('option', {
        isSelected: property('selected'),
      }),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    track: {
      scope: '[data-test-track]',
      label: text('label'),
      isEditable: isVisible('[data-test-toggle-yesno]'),
      toggle: clickable('[data-test-toggle-yesno] [data-test-handle]'),
      isTrack: property('checked', 'input'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    startDate: {
      scope: '[data-test-start-date]',
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    endDate: {
      scope: '[data-test-end-date]',
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    duration: {
      scope: '[data-test-duration]',
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    orderInSequence: {
      scope: '[data-test-order-in-sequence]',
      label: text('label'),
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      value: value('select'),
      select: fillable('select'),
      options: collection('option', {
        isSelected: property('selected'),
      }),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    childSequenceOrder: {
      scope: '[data-test-child-sequence-order]',
      label: text('label'),
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      value: value('select'),
      select: fillable('select'),
      options: collection('option', {
        isSelected: property('selected'),
      }),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    isSelective: {
      scope: '[data-test-is-selective]',
      isHidden: hasClass('hidden'),
    },
    minimum: {
      scope: '[data-test-minimum]',
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    maximum: {
      scope: '[data-test-maximum]',
      edit: clickable('.editinplace [data-test-edit]'),
      isEditable: isVisible('.editinplace'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    sessions: {
      scope: '[data-test-session-list-controls]',
      label: text('label'),
      editButton: {
        scope: 'button',
      },
    },
    minMaxEditor: {
      scope: '[data-test-curriculum-inventory-sequence-block-min-max-editor]',
      minimum: {
        scope: '[data-test-minimum]',
        label: text('label'),
        value: value('input'),
        set: fillable('input'),
        isDisabled: property('disabled', 'input'),
        hasError: isVisible('.validation-error-message'),
      },
      maximum: {
        scope: '[data-test-maximum]',
        label: text('label'),
        value: value('input'),
        set: fillable('input'),
        hasError: isVisible('.validation-error-message'),
      },
      save: clickable('[data-test-save]'),
      cancel: clickable('[data-test-cancel]'),
    },
    durationEditor,
  },
  sessionList,
  sessionManager,
};

export default definition;
export const component = create(definition);
