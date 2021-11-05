import { attribute, clickable, create, fillable, isVisible, text } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import postrequisiteEditor from './session/postrequisite-editor';
import yesNoToggle from './toggle-yesno';
import ilmDueDateAndTime from './session-overview-ilm-duedate';

export default create({
  scope: '[data-test-session-overview]',
  title: {
    scope: '.session-header',
    title: text('.editable'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    value: text('.title'),
  },
  copy: {
    scope: 'a.copy',
    visit: clickable(),
    link: attribute('href'),
    visible: isVisible(),
  },
  sessionType: {
    scope: '.sessiontype',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  sessionDescription: {
    scope: '.sessiondescription',
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
    scope: '.sessionilmhours',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  ilmDueDateAndTime,
  supplemental: {
    scope: '.sessionsupplemental',
    yesNoToggle,
  },
  specialAttire: {
    scope: '.sessionspecialattire',
    yesNoToggle,
  },
  specialEquipment: {
    scope: '.sessionspecialequipment',
    yesNoToggle,
  },
  attendanceRequired: {
    scope: '.sessionattendancerequired',
    yesNoToggle,
  },
  toggleIlm: {
    scope: '.independentlearningcontrol',
    yesNoToggle,
  },
  prerequisites: {
    scope: '.prerequisites',
  },
  postrequisite: {
    scope: '[data-test-postrequisite]',
    value: text('[data-test-edit]'),
    edit: clickable('[data-test-edit]'),
    editor: postrequisiteEditor,
  },
  lastUpdated: text('.last-update'),
});
