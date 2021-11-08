import { attribute, clickable, create, fillable, isVisible, text } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import postrequisiteEditor from './session/postrequisite-editor';
import yesNoToggle from './toggle-yesno';
import ilmDueDateAndTime from './session-overview-ilm-duedate';
import publicationStatus from './publication-status';
import publicationMenu from './session/publication-menu';

export default create({
  scope: '[data-test-session-overview]',
  title: {
    scope: '[data-test-title]',
    title: text('.editable'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    value: text(),
  },
  copy: {
    scope: '[data-test-copy]',
    visit: clickable(),
    link: attribute('href'),
    visible: isVisible(),
  },
  sessionType: {
    scope: '[data-test-session-type]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  sessionDescription: {
    scope: '[data-test-description]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message'),
  },
  instructionalNotes: {
    scope: '[data-test-instructional-notes]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message'),
  },
  ilmHours: {
    scope: '[data-test-ilm-hours]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  ilmDueDateAndTime,
  supplemental: {
    scope: '[data-test-supplemental]',
    yesNoToggle,
  },
  specialAttire: {
    scope: '[data-test-special-attire]',
    yesNoToggle,
  },
  specialEquipment: {
    scope: '[data-test-special-equipment]',
    yesNoToggle,
  },
  attendanceRequired: {
    scope: '[data-test-attendance-required]',
    yesNoToggle,
  },
  toggleIlm: {
    scope: '[data-test-ilm]',
    yesNoToggle,
  },
  prerequisites: {
    scope: '[data-test-prerequisites]',
  },
  postrequisite: {
    scope: '[data-test-postrequisite]',
    value: text('[data-test-edit]'),
    edit: clickable('[data-test-edit]'),
    editor: postrequisiteEditor,
  },
  lastUpdated: text('[data-test-last-update]'),
  publicationStatus,
  publicationMenu,
});
